module.exports = {
  apps: [
    {
      name: 'App-8000', // Instance chạy trên port 8000
      script: './index', // File binary của ứng dụng Go
      env: {
        PORT: 8000, // Biến môi trường để ứng dụng Go lắng nghe port 8000
      },
      watch: false,
      instances: 1, // Chỉ chạy 1 instance
      autorestart: true,
      max_memory_restart: '500M',
    },
    {
      name: 'App-8001', // Instance chạy trên port 8001
      script: './index', // File binary của ứng dụng Go
      env: {
        PORT: 8001, // Biến môi trường để ứng dụng Go lắng nghe port 8001
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
    },
  ],
};
