<template>
  <div class="page-container">
    <div class="overlay">
      <h1 class="title">CityScope</h1>
      <span class="alert">
        Read the
        <strong
          ><router-link to="/instructions">INSTRUCTIONS</router-link></strong
        >
        first!</span
      >
      <div class="form-container">
        <form @submit.prevent="registerUser">
          <div class="form-group">
            <label for="username">Username:</label>
            <input
              type="text"
              id="username"
              v-model="username"
              maxlength="10"
            />
          </div>
          <div class="form-group">
            <label for="difficulty">Difficulty:</label>
            <select id="difficulty" v-model="difficulty">
              <option value="very easy">Very Easy</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="very hard">Very Hard</option>
            </select>
          </div>
          <button type="submit" class="save-button">Save</button>
          <button @click="openInstructions()" class="instructions-button">
            INSTRUCTIONS!
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "StartView",
  data() {
    return {
      username: "",
      difficulty: "medium",
    };
  },
  methods: {
    openInstructions() {
      this.$router.push("/instructions");
    },
    registerUser() {
      fetch("https://alex.polan.sk/cityscope/leaderboard.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "register",
          name: this.username,
          score: 0,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            localStorage.setItem("username", this.username);
            localStorage.setItem("difficulty", this.difficulty);
            localStorage.setItem("uuid", data.uuid);
            this.$router.push("/game"); // Navigate to the game view
          } else {
            console.error("Registration failed:", data.error);
          }
        });
    },
  },
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-image: url("@/assets/usa.png");
  background-size: cover;
  background-position: center;
}

.overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
}

.title {
  font-size: 4em;
  margin-bottom: 5px;
  color: #fff;
}

.form-container {
  max-width: 400px;
  width: 100%;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.9);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="text"],
select {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.save-button {
  display: block;
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 10px;
}

.save-button:hover {
  background-color: #0056b3;
}

.instructions-button {
  display: block;
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.instructions-button:hover {
  background-color: #0056b3;
}

.alert {
  color: white;
  margin-bottom: 20px;
  font-size: 16px;
}

.alert > strong > a {
  color: white;
}
</style>
