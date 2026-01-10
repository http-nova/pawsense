import '../Home/Home.css'
import catimg from '../assets/blackcat.png';
function Home() {
    return <>
    <section className="home-section" id="home">
        <img src={catimg} alt="Black Cat" className="home-image" />
      <div className="home-content">
        <p>Where pet <br/> happiness meets <br/> pet health</p>
      </div>
    </section>
    </>
}

export default Home;