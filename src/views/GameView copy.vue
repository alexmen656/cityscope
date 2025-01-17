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
  </div>
</template>

<script>
import cities from "../assets/cities.json";

export default {
  name: "App",
  data() {
    return {
      cityName: "",
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

      const usaCenter = new window.mapkit.Coordinate(39.8283, -97.5795); // Zentrum der USA
      const usaSpan = new window.mapkit.CoordinateSpan(30.0, 50.0); // Großer Bereich, um die USA abzudecken

      const region = new window.mapkit.CoordinateRegion(usaCenter, usaSpan);
      const map = new window.mapkit.Map("map", {
        //    / mapType: window.mapkit.Map.MapTypes.Hybrid,
        center: usaCenter,
        region: region,
        isRotationEnabled: true,
        isZoomEnabled: false,
        showsZoomControl: false,
      });
      //map.setRotationAnimated(45);
      //map.rotation = 90; // Set the desired rotation angle in degrees

      this.map = map;
      //sxthis.map.rotation = 45; // Set the desired rotation angle in degrees

      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      this.cityName = randomCity.city;
      //  alert(this.cityName);
      const coordinate = new window.mapkit.Coordinate(
        Number(randomCity.latitude),
        Number(randomCity.longitude)
      );
      const annotation = new window.mapkit.MarkerAnnotation(coordinate);
      annotation.title = this.cityName;
      //annotation.subtitle = "California";
      annotation.color = "#00FF00";

      map.addAnnotation(annotation);

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
      // Radius kann hier verwendet werden, um eine Kreis-Annotation oder ähnliches hinzuzufügen
      const circleOverlay = new window.mapkit.CircleOverlay(coordinate, radius);
      map.addOverlay(circleOverlay);

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

              //previewCircle.style = baseStyle;
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
          this.guessSubmitted = true;
        }
      });
    },

    /*pickRandomCity() {
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      this.cityName = randomCity.city;

      const cityCoordinate = new window.mapkit.Coordinate(
        randomCity.latitude,
        randomCity.longitude
      );
      this.map.setCenterAnimated(cityCoordinate);
      new window.mapkit.MarkerAnnotation(cityCoordinate, {
        title: randomCity.city,
      });

      const coordinate = new window.mapkit.Coordinate(
        Number(randomCity.latitude),
        Number(randomCity.longitude)
      );
      const annotation = new window.mapkit.MarkerAnnotation(coordinate);
      annotation.title = "base.name";
      annotation.subtitle = "'s base";
      annotation.color = "#808080";
      annotation.glyphText = "☠️";
    },*/
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
</style>
