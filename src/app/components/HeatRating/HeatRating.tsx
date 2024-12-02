"use client";

import { useState } from 'react';
import './HeatRating.css';

function HeatRating({
    heat = 20,
}) {
    const [temperature, setTemperature] = useState(heat); // Température initiale

    const incrementerTemperature = () => {
        setTemperature(temperature + 1);
    };

    const decrementerTemperature = () => {
        setTemperature(temperature - 1);
    };

    // Définition de la couleur en fonction de la température
    let couleurTexte = 'text-black';

    if (temperature <= 10) {
        couleurTexte = 'text-blue-500';
    } else if (temperature >= 50) {
        couleurTexte = 'text-red-500';
    }

    return (
        <div className="heatRating flex items-center justify-center space-x-4 border-2 rounded-md">
            <button
                onClick={decrementerTemperature}
                className="px-4 py-2 focus:outline-none rounded-full"
            >
                -
            </button>
            <span className={`text-1xl font-bold ${couleurTexte}`}>
                {temperature}°
            </span>
            <button
                onClick={incrementerTemperature}
                className="px-4 py-2 focus:outline-none rounded-full"
            >
                +
            </button>
        </div>
    );
}

export default HeatRating;
