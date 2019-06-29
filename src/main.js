import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloLink, split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import VueApollo from 'vue-apollo'
import Vue from 'vue'
import App from './App.vue'
const GC_AUTH_TOKEN = 'token'
/* import ApolloClient from 'apollo-boost'
import VueApollo from 'vue-apollo'
const apolloClient = new ApolloClient({
  // You should use an absolute URL here
  uri: 'http://localhost:8000/graphql'
}) */

const httpLink = new HttpLink({
  // You should use an absolute URL here
  uri: 'http://localhost:8000/graphql'
})

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:3000/subscriptions',
  options: {
    reconnect: true
  }
})

const authMiddleware = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(GC_AUTH_TOKEN)
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : null
    }
  })
  return forward(operation)
})
const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
  },
  wsLink,
  authMiddleware.concat(httpLink)
)
const apolloClient = new ApolloClient({
  link: link,
  cache: new InMemoryCache(),
  connectToDevTools: true
})
Vue.use(VueApollo)
/* const apolloProvider = new VueApollo({
  defaultClient: apolloClient
}) */

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    $loadingKey: 'loading'
  }
})
Vue.config.productionTip = false

new Vue({
  apolloProvider,
  render: h => h(App)
}).$mount('#app')
