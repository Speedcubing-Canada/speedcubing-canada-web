import { ReactComponent as Icon } from "./icon.svg";
import { ReactComponent as Twitter } from "./twitter.svg";
import { ReactComponent as Facebook } from "./facebook.svg";
import { ReactComponent as Instagram } from "./instagram.svg";
import "./App.css";

const App = () => (
  <div className="main-container">
    <Icon width={50} height={50} />
    <h1>Speedcubing Canada</h1>
    <h3>More from us soon</h3>
    <div className="social-links">
      <a
        href="https://twitter.com/SpeedcubingCAN"
        title="twitter"
        rel="noopener noreferrer"
      >
        <Twitter width={25} height={25} />
      </a>
      <a
        href="https://www.facebook.com/speedcubingcan"
        title="facebook"
        rel="noopener noreferrer"
      >
        <Facebook width={25} height={25} />
      </a>
      <a
        href="https://www.instagram.com/speedcubingcanada/"
        title="instagram"
        rel="noopener noreferrer"
      >
        <Instagram width={25} height={25} />
      </a>
    </div>
  </div>
);

export default App;
