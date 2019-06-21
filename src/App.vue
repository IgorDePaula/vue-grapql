<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
<ul>
  <li v-for="user in users.data" :key="user.id">{{user.id}} - {{user.name}}</li>
</ul>
<p>total de usuarios: {{users.paginatorInfo.total}}</p>
    <button @click="aumenta">aumentar</button>
    <button @click="diminui">diminui</button>
    <p>{{page}}</p>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import users from './graphql/users.graphql'
export default {
  name: 'app',
  data () {
    return {
      users: {
        paginatorInfo: { }
      },
      user: '',
      page: 1
    }
  },
  methods: {
    aumenta () {
      this.page++
    },
    diminui () {
      if (this.page > 1) {
        this.page--
      }
    }
  },
  apollo: {
    // Simple query that will update the 'hello' vue property
    users: {
      query: users,
      variables () {
        return {
          page: this.page
        }
      }
    },
    user: {
      query: gql`{
                  user(id:2){
                      id
                      name
                      email

                  }
                }`
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
