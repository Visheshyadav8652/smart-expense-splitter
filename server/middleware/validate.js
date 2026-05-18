export const validate = (schema, target = "body") => (req, res, next) => {
  const data = target === "query" ? req.query : req.body;
  const result = schema.safeParse(data);
  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten(),
    });
  }

  if (target === "query") {
    req.query = result.data;
  } else {
    req.body = result.data;
  }

  next();
};
