module.exports = {
  apps: [
    {
      name: 'I', // Tên ứng dụng
      script: 'index.js', // Tệp chính
      cron_restart: '0 */5 * * *', // Restart mỗi 5 tiếng
      watch: false, // Không theo dõi tệp để tránh restart không cần thiết
      instances: 1, // Số instance (1 là mặc định)
      autorestart: true, // Tự động restart nếu gặp lỗi
      max_memory_restart: '500M', // Restart nếu vượt 500MB RAM
    },
  ],
};
