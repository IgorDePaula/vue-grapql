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
    <div>
      <h4>{{login ? 'Login to Your Account' : 'Sign Up'}}</h4>
      <div>
        <input
          v-show="!login"
          v-model="name"
          type="text"
          placeholder="Your name"/>
        <input
          v-model="email"
          type="text"
          placeholder="Your email address">
        <input
          v-model="password"
          type="password"
          placeholder="Password"/>
      </div>
      <button type="submit" variant="primary"
                @click="confirm()">
        {{login ? 'Login' : 'Create Account'}}
      </button>
      <button type="submit" variant="danger"
                @click="login = !login">
        {{login ? 'Sign Up' : 'Already have an account?'}}
      </button>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import users from './graphql/users.graphql'
import { CREATE_USER_MUTATION, LOGIN } from './graphql/graphql'
export default {
  name: 'app',
  data () {
    return {
      email: '',
      login: true,
      name: '',
      password: '',
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
    },
    confirm () {
      const { name, email, password } = this.$data
      if (this.login) {
        this.$apollo.mutate({
          mutation: LOGIN,
          variables: {
            email,
            password
          }
        }).then((result) => {
          // const id = result.data.signinUser.user.id
          const id = null
          const token = result.data.login
          console.log(result)
          this.saveUserData(id, token)
          console.log(result)
        }).catch((error) => {
          alert(error)
          // this.$router.push({ path: '/login' })
        })
      } else {
        this.$apollo.mutate({
          mutation: CREATE_USER_MUTATION,
          variables: {
            name,
            email,
            password
          }
        }).then((result) => {
          // const id = result.data.signinUser.user.id
          const id = null
          const token = result.data.login.token
          console.log(result)
          this.saveUserData(id, token)
          console.log(result)
        }).catch((error) => {
          alert(error)
          // this.$router.push({ path: '/login' })
        })
      }
      // window.location.reload()
      // this.$router.push({path: '/home'})
    },
    saveUserData (id, token) {
      // localStorage.setItem(GC_USER_ID, id)
      localStorage.setItem('token', token)
      // this.$root.$data.userId = localStorage.getItem(GC_USER_ID)
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
    $subscribe: {
      // When a tag is added
      postAdded: {
        query: gql`subscription tags($title: String!, $description: String!) {
        postAdded(type: $type) {
          id
          label
          type
        }
      }`,
        // Reactive variables
        variables () {
          // This works just like regular queries
          // and will re-subscribe with the right variables
          // each time the values change
          return {
            type: this.type,
          }
        },
        // Result hook
        // Don't forget to destructure `data`
        result ({ data }) {
          console.log(data.tagAdded)
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
