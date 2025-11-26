# Sudoku

<div id="app"></div>
<script src="https://unpkg.com/ejs@3.1.10/ejs.min.js"></script>
<script>
(async () => {
  const vue = await import("https://unpkg.com/vue@3.5.25/dist/vue.esm-browser.prod.js");
  const atsds = await import("https://unpkg.com/atsds@0.0.2/dist/tsds.mjs");
  const { loadModule } = await import("https://unpkg.com/vue3-sfc-loader@0.9.5/dist/vue3-sfc-loader.esm.js");

  const options = {
    moduleCache: { vue, atsds, ejs: window.ejs },
    async getFile(url) {
      const response = await fetch(url);
      return response.text();
    },
    addStyle(css) {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    }
  };

  const Sudoku = await loadModule('./Sudoku.vue', options)
  vue.createApp(Sudoku).mount('#app');
})();
</script>
