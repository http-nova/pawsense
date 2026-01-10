import { useState } from "react";
import "./Groom.css";
import groomcat from "../assets/groomcat.jpg";
import groomdog from "../assets/groomdog.jpg";
import groombunny from "../assets/groombunny.jpg";

const petData = {
    cat: {
        title: "Cat Grooming & Care Tips",
        img: groomcat,
        content: (
            <>
                <p><strong>Brushing:</strong> Brush your cat 2–3 times a week (daily for long-haired breeds) to remove loose fur and reduce hairballs.</p>
                <p><strong>Bathing:</strong> Cats usually clean themselves. Bathe only when necessary using cat-safe shampoo.</p>
                <p><strong>Nail Care:</strong> Trim nails every 2–3 weeks. Use proper pet nail clippers to avoid injury.</p>
                <p><strong>Ear & Eye Care:</strong> Check ears weekly for dirt or odor. Clean gently with a vet-recommended solution.</p>
                <p><strong>Dental Care:</strong> Brush teeth weekly using cat toothpaste to prevent dental diseases.</p>
                <p><strong>Health Tip:</strong> Sudden excessive shedding or bald patches may indicate stress or illness—consult a vet.</p>
            </>
        )
    },
    dog: {
        title: "Dog Grooming & Care Tips",
        img: groomdog,
        content: (
            <>
                <p><strong>Brushing:</strong> Brush daily for long-haired breeds and 2–3 times a week for short-haired dogs.</p>
                <p><strong>Bathing:</strong> Bathe once every 3–4 weeks using dog-specific shampoo to protect skin oils.</p>
                <p><strong>Nail Trimming:</strong> Trim nails once a month. Overgrown nails can cause pain and posture issues.</p>
                <p><strong>Ear Care:</strong> Clean ears weekly, especially for floppy-eared breeds prone to infections.</p>
                <p><strong>Dental Hygiene:</strong> Brush teeth 2–3 times a week and provide dental chews.</p>
                <p><strong>Exercise:</strong> Daily walks and playtime are essential for physical and mental health.</p>
            </>
        )
    },
    bunny: {
        title: "Bunny Grooming & Care Tips",
        img: groombunny,
        content: (
            <>
                <p><strong>Brushing:</strong> Brush weekly, daily during shedding season to prevent fur ingestion.</p>
                <p><strong>Bathing:</strong> Never bathe rabbits in water—it can cause shock. Use dry grooming methods only.</p>
                <p><strong>Nail Care:</strong> Trim nails every 4–6 weeks carefully to avoid cutting the quick.</p>
                <p><strong>Fur Monitoring:</strong> Check for matting, especially around legs and tail.</p>
                <p><strong>Living Space:</strong> Keep habitat clean and dry to avoid infections.</p>
                <p><strong>Diet Care:</strong> A fiber-rich diet (hay) helps prevent digestive and grooming-related issues.</p>
            </>
        )
    }
};

function Groom() {
    const [activePet, setActivePet] = useState(null);

    return (
        <>
            <section className="groom-section" id="guide">
                <h1>Grooming and Care Tips</h1>

                <div className="groom-container">
                    <div className="groom-card" onClick={() => setActivePet("cat")}>
                        <img src={groomcat} alt="Cat grooming" />
                        <p>Cat</p>
                    </div>

                    <div className="groom-card" onClick={() => setActivePet("dog")}>
                        <img src={groomdog} alt="Dog grooming" />
                        <p>Dog</p>
                    </div>

                    <div className="groom-card" onClick={() => setActivePet("bunny")}>
                        <img src={groombunny} alt="Bunny grooming" />
                        <p>Bunny</p>
                    </div>
                </div>
            </section>

            {activePet && (
                <div className="groom-modal-overlay" onClick={() => setActivePet(null)}>
                    <div className="groom-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setActivePet(null)}>✕</button>

                        <img src={petData[activePet].img} alt={activePet} />
                        <h2>{petData[activePet].title}</h2>

                        <div className="groom-modal-content">
                            {petData[activePet].content}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Groom;
