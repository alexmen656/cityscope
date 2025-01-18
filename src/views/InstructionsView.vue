<template>
  <div class="page-container">
    <div class="overlay">
      <h1 class="title">Instructions</h1>
      <div class="content-container">
        <p>
          Welcome to <strong>CityScope</strong>! This project is designed to
          test your knowledge of cities in the USA. Your goal is to guess the
          location of a randomly selected city on the map. However, your guess
          isn’t just a single point—it’s a <strong>radius</strong> that you
          place on the map. If the city falls within the radius, you score
          points!
        </p>
        <p>Follow these steps to play:</p>
        <ol>
          <li>Register with a username and select a difficulty level.</li>
          <li>A random US city will be displayed.</li>
          <li>
            Use <strong>Shift + Click</strong> on the map to place your guess,
            which includes a <strong>radius</strong> representing your estimate.
            While holding <strong>Shift</strong>, you can move your mouse to
            preview the size of the radius before finalizing your guess.
          </li>
          <li>Submit your guess and see your score.</li>
          <li>
            Check the leaderboard to see how you rank against other players.
          </li>
        </ol>
        <p>
          The difficulty levels determine how close your guess (radius) needs to
          be:
        </p>
        <ul>
          <li>
            <strong>Very Easy</strong>: City must be within a 1500 km radius - 1
            Point
          </li>
          <li>
            <strong>Easy</strong>: City must be within a 1200 km radius - 2
            Points
          </li>
          <li>
            <strong>Medium</strong>: City must be within a 1000 km radius - 3
            Points
          </li>
          <li>
            <strong>Hard</strong>: City must be within a 500 km radius - 5
            Points
          </li>
          <li>
            <strong>Very Hard</strong>: City must be within a 250 km radius - 10
            Points
          </li>
        </ul>
        <p>Ready to test your geography skills? Good luck, and have fun!</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "InstructionsView",
};
</script>

<style scoped>
.page-container {
  background-image: url("@/assets/usa.png"); /* Use the same background image as StartView */
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100vh;
}

.overlay {
  background-color: rgba(0, 0, 0, 0.7); /* Same overlay style as StartView */
  padding: 20px;
  border-radius: 24px;
  color: white;
  text-align: center;
  margin: 20px;
}

.title {
  font-size: 2.5em;
  margin-bottom: 20px;
}

.content-container {
  font-size: 1.2em;
  line-height: 1.5;
  text-align: left;
}

ol {
  text-align: left;
  margin: 20px 0;
}

li {
  margin-bottom: 10px;
}
</style>
