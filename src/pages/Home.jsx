import React from 'react';
import Hero from "../components/Hero.jsx";
import About from './About.jsx';
import Services from './Services.jsx';
import Pricing from './Pricing.jsx';
import Reviews from './Reviews.jsx';
import Schedule from './Schedule.jsx';
import Contact from './Contact.jsx';


const Home = () => {
    return (
        <div>
            <Hero />
            <About />
            <Services />
            <Pricing />
            <Reviews />
            <Schedule />
            <Contact />
        </div>
    );
};

export default Home;