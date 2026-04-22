import { renderNav } from "../components/nav.js";

renderNav();  

    document.getElementById("app").innerHTML = `
  <main>

    <section class="hero">
      <div class="hero-title">
        <h1 class="reveal-text">Bizy Studio</h1>
        <h1 class="reveal-text accent">ENGINEERING</h1>
      </div>
    </section>
    
    <footer class="site-footer">
       BIZY STUDIO / MUSIC PRODUCER & WEB DEVELOPER. © 2026
    </footer>

  </main>
`;