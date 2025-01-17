<template>
  <div>
    <div class="header">
      <h1>{{ cityName }}</h1>
      <div class="user-info">
        <span>{{ username }}</span>
        <router-link to="/leaderboard" class="leaderboard-link"
          >Leaderboard</router-link
        >
      </div>
    </div>
    <div id="map" style="width: 100%; height: 100vh"></div>
    <div id="score">Score: {{ score }}</div>
    <button v-if="guessSubmitted" @click="nextCity">Weiter</button>
  </div>
</template>

<script>
import cities from "../assets/cities.json";

export default {
  name: "App",
  data() {
    return {
      score: 0,
      cityName: "",
      cityState: "",
      guessed: false,
      map: null,
      difficulty: localStorage.getItem("difficulty"),
      username: localStorage.getItem("username"),
      guessSubmitted: false,
    };
  },
  async mounted() {
    await this.initMap();
    //  this.pickRandomCity();
  },
  methods: {
    async initMap() {
      await window.mapkit.init({
        authorizationCallback: function (done) {
          fetch("https://alex.polan.sk/people-map/verify.php")
            .then((res) => res.text())
            .then(done);
        },
        language: "en",
      });

      let radius;
      switch (this.difficulty) {
        case "very easy":
          radius = 3000;
          break;
        case "easy":
          radius = 2000;
          break;
        case "medium":
          radius = 1000;
          break;
        case "hard":
          radius = 500;
          break;
        default:
          radius = 2000;
      }
      radius = radius * 1000; //m -> km

      const usaCenter = new window.mapkit.Coordinate(39.8283, -97.5795); // Zentrum der USA
      const usaSpan = new window.mapkit.CoordinateSpan(30.0, 50.0); // Großer Bereich, um die USA abzudecken

      const region = new window.mapkit.CoordinateRegion(usaCenter, usaSpan);
      const map = new window.mapkit.Map("map", {
        center: usaCenter,
        region: region,
        isRotationEnabled: true,
        isZoomEnabled: false,
        showsZoomControl: false,
      });
      this.map = map;

      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      this.cityName = randomCity.city;
      this.cityState = randomCity.state;

      let previewCircle = null;

      document
        .querySelector(".mk-map-view")
        .addEventListener("mousemove", (event) => {
          const point = new DOMPoint(event.clientX, event.clientY);
          const coordinate = map.convertPointOnPageToCoordinate(point);

          if (event.shiftKey) {
            if (previewCircle) {
              previewCircle.coordinate = coordinate;
            } else {
              const radiusInMeters = radius;
              previewCircle = new window.mapkit.CircleOverlay(
                coordinate,
                radiusInMeters
              );

              map.addOverlay(previewCircle);
            }
          } else {
            if (previewCircle) {
              map.removeOverlay(previewCircle);
              previewCircle = null;
            }
          }
        });

      map.element.addEventListener("mouseleave", () => {
        if (previewCircle) {
          map.removeOverlay(previewCircle);
          previewCircle = null;
        }
      });

      map.element.addEventListener("click", async (event) => {
        if (!event.shiftKey) {
          return;
        }

        let coordinate = map.convertPointOnPageToCoordinate(
          new DOMPoint(event.pageX, event.pageY)
        );

        if (event.shiftKey) {
          const guessAnnotation = new window.mapkit.MarkerAnnotation(
            coordinate,
            {
              title: "Your Guess",
              color: "#160808",
            }
          );
          map.addAnnotation(guessAnnotation);
          const guessOverlay = new window.mapkit.CircleOverlay(
            coordinate,
            radius
          );
          map.addOverlay(guessOverlay);
          this.guessed = this.isWithinRadius(
            {
              latitude: coordinate.latitude,
              longitude: coordinate.longitude,
            },
            {
              latitude: randomCity.latitude,
              longitude: randomCity.longitude,
            },
            radius / 1000
          );

          if (this.guessed) {
            this.score += 1;
          }

          this.guessSubmitted = true;
          if (this.guessSubmitted) {
            const coordinate = new window.mapkit.Coordinate(
              Number(randomCity.latitude),
              Number(randomCity.longitude)
            );

            const annotation = new window.mapkit.MarkerAnnotation(coordinate);
            annotation.title = this.cityName;
            annotation.subtitle = this.cityState;
            annotation.color = this.guessed ? "#00FF00" : "#FF0000";
            map.addAnnotation(annotation);
          }
        }
      });
    },
   // newRound(map) {
   nextCity() {
      const map = this.map;
      map.annotations.forEach((annotation) => {
        map.removeAnnotation(annotation);
      });
    },
   /* nextCity() {
      this.guessSubmitted = false;
      // Logic to load the next city
    },*/
    isWithinRadius(coord1, coord2, radius) {
      const R = 6371; // Radius of the Earth in kilometers
      const dLat = this.deg2rad(coord2.latitude - coord1.latitude);
      const dLon = this.deg2rad(coord2.longitude - coord1.longitude);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.deg2rad(coord1.latitude)) *
          Math.cos(this.deg2rad(coord2.latitude)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in kilometers
      return distance <= radius;
    },
    deg2rad(deg) {
      return deg * (Math.PI / 180);
    },
  },
};
</script>
<style scoped>
#map::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: radial-gradient(
    circle,
    rgba(0, 0, 0, 0) 60%,
    rgba(0, 0, 0, 0.4) 100%
  );
  z-index: 1000;
}

.header {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
}

h1 {
  margin: 0;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px;
  border-radius: 5px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info span {
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px;
  border-radius: 5px;
  margin-right: 10px;
}

.leaderboard-link {
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px;
  border-radius: 5px;
  text-decoration: none;
}

.leaderboard-link:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

#score {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: white;
  padding: 5px;
  border-radius: 5px;
}

button {
  position: absolute;
  bottom: 10px;
  right: 10px;
}
</style>
