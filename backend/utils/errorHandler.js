exports.handleError = (res, error, defaultMessage) => {
    console.error(error);
    res.status(500).json({ message: defaultMessage });
};
