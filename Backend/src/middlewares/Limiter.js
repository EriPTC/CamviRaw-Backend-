import rateLimit from "express-rate-limit";

const limiter = rateLimit({ 
    windowMs: 1 * 60 * 1000, // 1 minutos
    max: 30, // Limitar a 30 solicitudes por ventana
    message: {
        status : 429,
        error: "too many requests"
    }
});

export default limiter;