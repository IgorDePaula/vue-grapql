import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloLink, split, Observable } from 'apollo-link'
// import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import VueApollo from 'vue-apollo'
import Vue from 'vue'
import App from './App.vue'
import * as io from 'socket.io-client'
import VueEcho from 'vue-echo'
import Echo from 'laravel-echo'
const GC_AUTH_TOKEN = 'token'
/* import ApolloClient from 'apollo-boost'
import VueApollo from 'vue-apollo'
const apolloClient = new ApolloClient({
  // You should use an absolute URL here
  uri: 'http://localhost:8000/graphql'
}) */
const config = {
  broadcaster: 'socket.io',
  host: 'localhost:6001',
  client: io
}

const socket = io.connect('http://localhost:6001/')
socket.on('connection', socket => {
  socket.join('private-lighthouse-TP7kILZVtYG9KT10i1gGh18O4orrwiaK-1562433647').on('articleUpdated', console.log)
})

socket.on('App\\Providers\\Message', data => {
  console.log(data)
})

socket.on('Message', data => {
  console.log(data)
})

const echo = new Echo(config)
// laravel_database_laravel_cache:graphql.subscriber.private-lighthouse graphql.topic.ARTICLE_UPDATED
echo.channel('MessageEvent').listen('App\\Providers\\Message', function (payload) {
  console.log('payload 1', payload)
})
echo.channel('laravel_database_MessageEvent').listen('App\\Providers\\Message', function (payload) {
  console.log('payload 2', payload)
})
echo.channel('laravel_database_MessageEvent').listen('Message', function (payload) {
  console.log('payload 3', payload)
})
echo.channel('MessageEvent').listen('Message', function (payload) {
  console.log('payload 4', payload)
})

Vue.use(VueEcho, config)
class PusherLink extends ApolloLink {
  constructor (options) {
    super()
    // Retain a handle to the Pusher client
    this.io = options.io
  }

  request (operation, forward) {
    throw Error('erro no request do websocket do apollo')
    // eslint-disable-next-line no-unreachable
    console.log('operation on request', operation)
    console.log('foward on request', forward)
    return new Observable(observer => {
      // Check the result of the operation
      forward(operation).subscribe({
        next: data => {
          // If the operation has the subscription extension, it's a subscription
          const subscriptionChannel = this._getChannel(
            data,
            operation
          )
          console.log('subcription channel', subscriptionChannel)
          if (subscriptionChannel) {
            this._createSubscription(subscriptionChannel, observer)
          } else {
            // No subscription found in the response, pipe data through
            observer.next(data)
            observer.complete()
          }
        }
      })
    })
  }

  _getChannel (data, operation) {
    console.log('get channel', operation.operationName)
    return !!data.extensions &&
    !!data.extensions.lighthouse_subscriptions &&
    !!data.extensions.lighthouse_subscriptions.channels
      // eslint-disable-next-line standard/computed-property-even-spacing
      ? data.extensions.lighthouse_subscriptions.channels[
        operation.operationName
      ]
      : null
  }

  _createSubscription (subscriptionChannel, observer) {
    console.log('create subscription', subscriptionChannel)
    const pusherChannel = this.io.join(subscriptionChannel)
    // Subscribe for more update
    // laravel_database_MessageEvent
    pusherChannel.on(subscriptionChannel, payload => {
      if (!payload.more) {
        // This is the end, the server says to unsubscribe
        this.io.leave(subscriptionChannel)
        observer.complete()
      }
      const result = payload.result
      if (result) {
        // Send the new response to listeners
        observer.next(result)
      }
    })
  }
}

const pusherLink = new PusherLink({
  pusher: io.connect('localhost:6001')
})

const httpLink = new HttpLink({
  // You should use an absolute URL here
  uri: 'http://localhost:8000/graphql'
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
      definition.operation === 'subscription' &&
      definition.operation === 'Document'
  },
  pusherLink,
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
