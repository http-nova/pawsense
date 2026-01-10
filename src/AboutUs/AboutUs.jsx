import "./AboutUs.css";
import aboutimg from "../Assets/aboutimg.jpg";

function AboutUs() {
    return (
        <section className="about-section" id="aboutUs">
            <h1>About PawSense</h1>

            <div className="about-container">
                <div className="about-img">
                    <img src={aboutimg} alt="About PawSense" />
                </div>

                <div className="about-text">
                    <p>
                        PawSense is a pet-focused platform built with one simple goal —
                        to make pet care easier, smarter, and more accessible for everyone.
                    </p>

                    <p>
                        We believe pets are more than companions — they are family.
                        That’s why PawSense brings together everything a pet parent needs
                        in one place, from quality pet toys to expert grooming and care guides.
                    </p>

                    <p>
                        Whether you are a new pet owner or an experienced one, PawSense
                        helps you make informed decisions, provide better care, and build
                        a stronger bond with your furry friends.
                    </p>
                </div>
            </div>
        </section>
    );
}

export default AboutUs;
