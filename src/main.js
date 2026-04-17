const path = window.location.pathname;

if (path.includes("midi")) {
  import("./pages/midi.js");
} else {
  import("./pages/home.js");
}

import "./styles/global.css";