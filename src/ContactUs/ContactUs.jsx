import "./ContactUs.css";
import catpng from "../assets/catpng.png";
import instagram from "../assets/instagram.png";
import facebook from "../assets/facebook.png";
import twitter from "../assets/twitter.png";

function ContactUs() {
  return (
    <section className="contact-section" id="contactUs">

      {/* Background branding - large P + awsense */}
      <div className="brand-text">
        <p className="brand-p">P</p>
        <p className="brand-rest">awsense</p>
      </div>

      {/* Cat */}
      <img src={catpng} alt="Cat" className="brand-cat" />

      {/* Right content */}
      <div className="contact-content">
        <h2>Contact us</h2>

        <p>123, abcd colony, pune, maharashtra</p>
        <p>pawsensemain@gmail.com</p>
        <p>+91 1234356470</p>

        <div className="socials">
            <a href="#" target="_blank" rel="noopener noreferrer"><img src={facebook} alt="Facebook" /></a>
            <a href="#" target="_blank" rel="noopener noreferrer"><img src={instagram} alt="instagram" /></a>
            <a href="#" target="_blank" rel="noopener noreferrer"><img src={twitter} alt="twitter"/></a>
        </div>
      </div>

    </section>
  );
}

export default ContactUs;