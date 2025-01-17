<template>
    <div class="page-container">
      <div class="overlay">
        <h1 class="title">CityScope</h1>
        <div class="form-container">
          <form @submit.prevent="saveToLocalStorage">
            <div class="form-group">
              <label for="username">Username:</label>
              <input type="text" id="username" v-model="username" />
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
        username: localStorage.getItem('username') || '',
        difficulty: localStorage.getItem('difficulty') || 'easy'
      };
    },
    methods: {
      saveToLocalStorage() {
        localStorage.setItem('username', this.username);
        localStorage.setItem('difficulty', this.difficulty);
        this.$router.push('/game');
      }
    }
  };
  </script>
  
  <style scoped>
  .page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-image: url('@/assets/usa.png');
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
    margin-bottom: 20px;
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
  }
  
  .save-button:hover {
    background-color: #0056b3;
  }
  </style>