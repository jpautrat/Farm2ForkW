const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // Mongoose 6+ uses these by default, but keeping for clarity/older versions
            // useNewUrlParser: true, 
            // useUnifiedTopology: true,
            // useCreateIndex: true, // Not supported in Mongoose 6+
            // useFindAndModify: false // Not supported in Mongoose 6+
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;
