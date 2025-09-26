<template>
  <div id="app">
    <header class="header">
      <div class="header-content">
        <router-link to="/" class="logo">Octo Books</router-link>
        <nav>
          <ul class="nav">
            <li><router-link to="/">Accueil</router-link></li>
            <li><router-link to="/books">Livres</router-link></li>
          </ul>
        </nav>
      </div>
    </header>

    <main>
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
@import './assets/main.css';
</style>
