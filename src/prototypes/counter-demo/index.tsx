/**
 * @name 计数器
 */

import React, { useState } from 'react';
import './style.css';

const CounterPage = () => {
    const [count, setCount] = useState(0);

    return (
        <div className="counter-page">
            <button
                className="counter-btn"
                onClick={() => setCount(count + 1)}
            >
                {count}
            </button>
        </div>
    );
};

export default CounterPage;