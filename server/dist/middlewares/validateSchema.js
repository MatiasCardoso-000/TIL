export const validateSchema = (schema) => (req, res, next) => {
    try {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res
                .status(400)
                .json({ errors: result.error.flatten().fieldErrors });
        }
        return next();
    }
    catch (error) {
        return res.status(500).json({ errors: ["Internal server error"] });
    }
};
//# sourceMappingURL=validateSchema.js.map