import React,{ createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const PlansContext = createContext();

export const usePlans = () => useContext(PlansContext);

export const PlansProvider = ({ children }) =>{
    const [plans,setPlans] = useState([]);
    const [isPlansLoading, setIsPlansLoading] = useState(true);

    const fetchPlans = async () => {
        try {
            const response = await axios.get('/api/plans/', {}, { withCredentials: true });
            const plansWithParsedPrice = response.data.plans.map(plan => ({
                ...plan,
                price: parseFloat(plan.price.$numberDecimal) // Convert Decimal128 to number
            }));
            setPlans(plansWithParsedPrice);
        } catch(error) {
            setPlans(null);
        } finally {
            setIsPlansLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    return(
        <PlansContext.Provider value={{ plans, setPlans, isPlansLoading, fetchPlans  }}>
            {children}
        </PlansContext.Provider>
    );
};