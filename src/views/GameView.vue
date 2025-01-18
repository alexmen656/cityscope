<template>
  <div>
    <div class="header">
      <h1>City to guess: <strong>{{ cityName }}</strong></h1>
      <div class="user-info">
        <select
          class="difficulty"
          v-model="difficulty"
          @change="updateDifficulty"
        >
          <option value="very easy">Very Easy</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="very hard">Very Hard</option>
        </select>
        <span @click="fetchLeaderboard" class="leaderboard-link"
          >Leaderboard</span
        >
        <span @click="logout()"
          ><i class="fa-solid fa-user"></i> {{ username }}</span
        >
      </div>
    </div>
    <div id="map" style="width: 100%; height: 100vh"></div>
    <div id="score" class="score2">Score: {{ score }}</div>
    <button class="nextCity" @click="nextCity">
      <i
        :class="
          guessSubmitted
            ? 'fa-solid fa-arrow-right'
            : 'fa-solid fa-rotate-right'
        "
      ></i>
      {{ guessSubmitted ? "Next" : "Skip" }}</button
    ><!--v-if="guessSubmitted"-->

    <div v-if="showLeaderboard" class="modal">
      <div class="modal-content">
        <span class="close" @click="showLeaderboard = false">&times;</span>
        <h2>Leaderboard</h2>
        <div class="podium">
          <div v-if="leaderboard[1]" class="second">
            <div class="position">2.</div>
            <div class="name">{{ leaderboard[1].name }}</div>
            <div class="score">{{ leaderboard[1].score }}</div>
          </div>
          <div v-if="leaderboard[0]" class="first">
            <div class="position">1.</div>
            <div class="name">{{ leaderboard[0].name }}</div>
            <div class="score">{{ leaderboard[0].score }}</div>
          </div>
          <div v-if="leaderboard[2]" class="third">
            <div class="position">3.</div>
            <div class="name">{{ leaderboard[2].name }}</div>
            <div class="score">{{ leaderboard[2].score }}</div>
          </div>
        </div>
        <ul>
          <li
            v-for="(player, index) in leaderboard.slice(3)"
            :key="player.name"
            :class="{
              striped: index % 2 === 0,
              'non-striped': index % 2 !== 0,
            }"
            class="l_li"
          >
            <span class="place">{{ index + 4 }}. Place</span>
            <span
              >{{ player.name
              }}<!--:--></span
            >
            <span class="score">{{ player.score }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import cities from "../assets/cities.json";
import JSConfetti from "js-confetti";
import { shallowRef } from "vue";

export default {
  name: "App",
  data() {
    return {
      score: 0,
      cityName: "",
      cityState: "",
      guessed: false,
      showLeaderboard: false,
      map: shallowRef(null),
      difficulty: localStorage.getItem("difficulty"),
      username: localStorage.getItem("username"),
      uuid: localStorage.getItem("uuid"),
      guessSubmitted: false,
      leaderboard: [],
      randomCity: {},
    };
  },
  async mounted() {
    if (!this.username || !this.uuid) {
      this.$router.push("/");
    }
    this.initRadius();
    this.fetchUserScore();
    await this.initMap();
  },
  methods: {
    fetchLeaderboard() {
      fetch("https://alex.polan.sk/cityscope/leaderboard.php")
        .then((response) => response.json())
        .then((data) => {
          this.leaderboard = data;
          this.showLeaderboard = true;
        });
    },
    fetchUserScore() {
      fetch(`https://alex.polan.sk/cityscope/leaderboard.php?uuid=${this.uuid}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.score !== undefined) {
            this.score = Number(data.score);
          } else {
            console.error("Error fetching user score:", data.error);
          }
        });
    },
    updateUserScore(count) {
      fetch("https://alex.polan.sk/cityscope/leaderboard.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          uuid: this.uuid,
          score: count,
        }),
      });
    },
    updateDifficulty() {
      localStorage.setItem("difficulty", this.difficulty);
      this.initRadius();
    },
    initRadius() {
      let radius;
      let points_to_win;
      switch (this.difficulty) {
        case "very easy":
          radius = 1500;
          points_to_win = 1;
          break;
        case "easy":
          radius = 1200;
          points_to_win = 2;
          break;
        case "medium":
          radius = 1000;
          points_to_win = 3;
          break;
        case "hard":
          radius = 500;
          points_to_win = 5;
          break;
        case "very hard":
          radius = 250;
          points_to_win = 10;
          break;
        default:
          radius = 1200;
          points_to_win = 2;
      }
      radius = radius * 1000; //m -> km
      this.radius = radius;
      this.points_to_win = points_to_win;

    },
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
        center: usaCenter,
        region: region,
        isRotationEnabled: true,
        isZoomEnabled: false,
        showsZoomControl: false,
      });
      this.map = map;

      this.nextCity();

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
              const radiusInMeters = this.radius;
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

        if (event.shiftKey && !this.guessSubmitted) {
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
            this.radius
          );
          map.addOverlay(guessOverlay);
          this.guessed = this.isWithinRadius(
            {
              latitude: coordinate.latitude,
              longitude: coordinate.longitude,
            },
            {
              latitude: this.randomCity.latitude,
              longitude: this.randomCity.longitude,
            },
            this.radius / 1000
          );

          if (this.guessed) {
            this.score += this.points_to_win;
            this.updateUserScore(this.points_to_win);
            const jsConfetti = new JSConfetti();
            jsConfetti.addConfetti();
          }

          this.guessSubmitted = true;
          if (this.guessSubmitted) {
            const coordinate = new window.mapkit.Coordinate(
              Number(this.randomCity.latitude),
              Number(this.randomCity.longitude)
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
      this.map.annotations.forEach((annotation) => {
        this.map.removeAnnotation(annotation);
      });
      this.map.overlays.forEach((overlay) => {
        this.map.removeOverlay(overlay);
      });

      this.guessSubmitted = false;
      this.guessed = false;

      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      this.randomCity = randomCity;
      this.cityName = randomCity.city;
      this.cityState = randomCity.state;

      // Füge Logik hinzu, falls du spezielle Vorbereitungen für die nächste Runde brauchst
      //console.log(`Neue Stadt: ${this.cityName}, ${this.cityState}`);
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
    logout() {
      if (
        confirm(
          "Are you sure you want to log out?\nYou will lose access to this account!"
        )
      ) {
        localStorage.removeItem("difficulty");
        localStorage.removeItem("username");
        localStorage.removeItem("uuid");
        this.$router.push("/");
      }
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
  align-items: start;
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

.user-info span,
.difficulty {
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 5px;
  font-size: 16px;
  border: none;
}
.difficulty {
  height: 39px;
  margin-right: 10px;
}

.leaderboard-link {
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 5px;
  text-decoration: none;
  font-size: 16px;
  margin-right: 10px;
}

.leaderboard-link:hover {
  background-color: rgba(0, 0, 0, 0.9);
}

#score {
  position: absolute;
  bottom: 10px;
  left: 10px;
}

button {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 500px;
  border-radius: 10px;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin-bottom: 20px;
}

.podium > div {
  text-align: center;
  margin: 0 10px;
}

.first {
  order: 1;
  background-color: gold;
  padding: 10px;
  border-radius: 10px;
  height: 130px;
  width: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.second {
  order: 0;
  background-color: silver;
  padding: 10px;
  border-radius: 10px;
  height: 100px;
  width: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.third {
  order: 2;
  background-color: #cd7f32;
  padding: 10px;
  border-radius: 10px;
  height: 80px;
  width: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.position {
  font-size: 24px;
  font-weight: bold;
}

.name {
  font-size: 18px;
}

.score2,
.nextCity {
  font-size: 24px;
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 5px;
}

.nextCity:focus,
.nextCity:focus-visible,
.difficulty {
  /*border: none !important;*/
  outline: none !important;
}

h2 {
  text-align: center;
  margin-top: 10px;
  padding-left: 18.5px;
}

.l_li {
  display: flex;
  /*justify-content: space-between;*/
  padding: 2px;
}

.l_li > span {
  flex: 1;
  text-align: center;
}

.l_li > .score {
  text-align: end;
}

.l_li > .place {
  text-align: start;
}

.l_li.striped {
  background-color: #cdcdcd;
}

.l_li.non-striped {
  background-color: #ffffff;
}

ul {
  margin: 0;
  padding: 10px;
}
</style>
