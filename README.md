# ConBi - Ứng Dụng Quản Lý Task


<img width="1301" height="746" alt="Conbi" src="https://github.com/user-attachments/assets/f691c168-1408-4b9b-bac6-da343fbff71d" />

## Giới Thiệu

ConBi là một ứng dụng quản lý task đơn giản được xây dựng trên nền tảng Cloud, sử dụng **React** cho frontend và **Supabase** cho backend. Dự án này được phát triển như một bài tập thực hành về Cloud Computing, tập trung vào các thao tác CRUD và xác thực người dùng.

## Công Nghệ Sử Dụng

### Frontend
- **React 18** - thư viện UI component-based
- **Vite** - build tool nhanh cho modern web apps
- **Lucide React** - bộ icon đẹp và nhẹ

### Backend
- **Supabase** - nền tảng Backend-as-a-Service (BaaS)
  - PostgreSQL database
  - Authentication service
  - Real-time subscriptions
  - RESTful API tự động

## Cấu Trúc Database

### Bảng `tasks`
- `id` - UUID, khóa chính
- `user_id` - UUID, liên kết với auth.users
- `title` - text, tiêu đề task
- `description` - text, mô tả chi tiết
- `status` - text, trạng thái (pending/in_progress/completed)
- `priority` - text, độ ưu tiên (low/medium/high)
- `due_date` - timestamp, hạn hoàn thành
- `created_at` - timestamp, thời gian tạo
- `updated_at` - timestamp, thời gian cập nhật

### Bảng `profiles`
- `id` - UUID, liên kết với auth.users
- `email` - text, email người dùng
- `full_name` - text, tên đầy đủ
- `avatar_url` - text, link ảnh đại diện
- `created_at` - timestamp
- `updated_at` - timestamp

### Bảng `categories` (dự phòng cho tương lai)
- `id` - UUID, khóa chính
- `user_id` - UUID
- `name` - text, tên category
- `color` - text, màu hiển thị
- `created_at` - timestamp

## Tính Năng Chính

### 1. Xác Thực Người Dùng (Authentication)
- ✅ Đăng ký tài khoản mới (email/password)
- ✅ Đăng nhập
- ✅ Đăng xuất
- ✅ Quản lý session tự động

### 2. Quản Lý Task (CRUD Operations)
- ✅ **Create** - Tạo task mới với đầy đủ thông tin
- ✅ **Read** - Xem danh sách tất cả task của user
- ✅ **Update** - Chỉnh sửa thông tin task
- ✅ **Delete** - Xóa task

### 3. Giao Diện Người Dùng
- Dashboard hiển thị thống kê task theo trạng thái
- Form tạo/chỉnh sửa task với modal
- Hiển thị badge cho status và priority
- Responsive design

## Cài Đặt và Chạy

### 1. Yêu Cầu
- Node.js (v18 trở lên)
- Tài khoản Supabase (free plan)

### 2. Cấu Hình Supabase

1. Tạo project mới tại [supabase.com](https://supabase.com)
2. Chạy SQL scripts trong file `schema.md` tại SQL Editor
3. Lấy API credentials từ Project Settings > API

### 3. Cài Đặt Dependencies

```bash
npm install
```

### 4. Cấu Hình Environment Variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Điền thông tin Supabase:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Chạy Development Server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

### 6. Build Production

```bash
npm run build
```

## Phân Tích: Supabase là SaaS, PaaS hay BaaS?

### Supabase là **Backend-as-a-Service (BaaS)**

#### Lý do:

1. **Cung cấp backend hoàn chỉnh**
   - Database (PostgreSQL) đã được setup sẵn
   - Authentication service tích hợp
   - API endpoints tự động generate
   - Real-time subscriptions
   - Storage service

2. **Không cần quản lý infrastructure**
   - Không phải setup server
   - Không phải cấu hình database
   - Không phải viết backend code cho CRUD cơ bản
   - Supabase lo tất cả về scaling, backup, security

3. **Developer-focused**
   - API clients cho nhiều ngôn ngữ (JS, Python, Flutter, etc.)
   - Auto-generated REST API và GraphQL
   - Dashboard để quản lý data
   - Real-time data synchronization

4. **So sánh với các model khác:**
   - **SaaS** (Software as a Service): Ứng dụng hoàn chỉnh cho end-user (Gmail, Dropbox). Supabase không phải SaaS vì nó là platform cho developers, không phải end-users.
   - **PaaS** (Platform as a Service): Cung cấp platform để deploy code (Heroku, Vercel). Supabase cung cấp nhiều hơn - bao gồm cả database và backend services.
   - **BaaS** (Backend as a Service): Cung cấp backend services sẵn có. **Đây chính là Supabase**.

### Đặc điểm nổi bật của Supabase BaaS:

✅ **Open source** - có thể self-host
✅ **PostgreSQL** - database mạnh mẽ, không giới hạn bởi NoSQL
✅ **Real-time** - data updates tự động
✅ **Row Level Security** - bảo mật ở cấp độ database
✅ **Auto-generated APIs** - không cần viết backend code
✅ **Free tier hào phóng** - phù hợp cho học tập và dự án nhỏ

## Kiến Trúc Cloud App

```
┌─────────────────┐
│   End Users     │
│   (Browser)     │
└────────┬────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐
│   React App     │
│   (Frontend)    │
│   - Vite        │
│   - Components  │
└────────┬────────┘
         │
         │ REST API / Real-time
         │ (@supabase/supabase-js)
         ▼
┌─────────────────────────────────┐
│        Supabase Cloud           │
│  (Backend-as-a-Service)         │
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │   Authentication        │   │
│  │   (Email/Password)      │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │   PostgreSQL Database   │   │
│  │   - tasks table         │   │
│  │   - profiles table      │   │
│  │   - categories table    │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │   Auto-generated API    │   │
│  │   (REST + GraphQL)      │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │   Real-time Engine      │   │
│  │   (WebSocket)           │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

## Screenshots

### 1. Database Tables trong Supabase
- Chụp màn hình Table Editor trong Supabase Dashboard
- Hiển thị cấu trúc bảng `tasks`, `profiles`, `categories`

### 2. Authentication Setup
- Chụp Authentication settings
- Hiển thị danh sách users đã đăng ký

### 3. API Testing
- Chụp API Docs trong Supabase
- Test CRUD operations qua Supabase UI hoặc Postman

### 4. Ứng dụng chạy
- Màn hình đăng nhập/đăng ký
- Dashboard với danh sách tasks
- Form tạo/sửa task

## API Testing với cURL và Postman

ConBi sử dụng Supabase REST API để thực hiện các thao tác CRUD. Dưới đây là hướng dẫn test API với cURL và Postman.

### Lấy API Credentials

1. Truy cập Supabase Dashboard
2. Vào **Settings** > **API**
3. Copy:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon/public key**: `eyJhbG...` (API Key)

### Headers cần thiết

Tất cả các request cần có headers sau:

```
apikey: YOUR_SUPABASE_ANON_KEY
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
Content-Type: application/json
```

---

### 1. CREATE - Tạo Task Mới

#### cURL:
```bash
curl -X POST 'https://your-project.supabase.co/rest/v1/tasks' \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "your-user-uuid",
    "title": "Complete homework",
    "description": "Finish math assignment",
    "status": "pending",
    "priority": "high",
    "due_date": "2026-02-15T10:00:00Z"
  }'
```

#### Postman:
- **Method**: `POST`
- **URL**: `https://your-project.supabase.co/rest/v1/tasks`
- **Headers**:
  ```
  apikey: YOUR_SUPABASE_ANON_KEY
  Authorization: Bearer YOUR_SUPABASE_ANON_KEY
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "user_id": "your-user-uuid",
    "title": "Complete homework",
    "description": "Finish math assignment",
    "status": "pending",
    "priority": "high",
    "due_date": "2026-02-15T10:00:00"
  }
  ```

---

### 2. READ - Lấy Danh Sách Tasks

#### cURL - Lấy tất cả tasks:
```bash
curl -X GET 'https://your-project.supabase.co/rest/v1/tasks?select=*' \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

#### cURL - Lấy tasks của user cụ thể:
```bash
curl -X GET 'https://your-project.supabase.co/rest/v1/tasks?user_id=eq.YOUR_USER_UUID&select=*' \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

#### cURL - Lấy tasks theo status:
```bash
curl -X GET 'https://your-project.supabase.co/rest/v1/tasks?status=eq.pending&select=*' \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

#### Postman:
- **Method**: `GET`
- **URL**: `https://your-project.supabase.co/rest/v1/tasks?select=*`
- **Headers**:
  ```
  apikey: YOUR_SUPABASE_ANON_KEY
  Authorization: Bearer YOUR_SUPABASE_ANON_KEY
  ```
- **Query Params** (tùy chọn):
  - `user_id=eq.YOUR_USER_UUID` - Filter by user
  - `status=eq.pending` - Filter by status
  - `priority=eq.high` - Filter by priority
  - `order=created_at.desc` - Sort by date

---

### 3. UPDATE - Cập Nhật Task

#### cURL:
```bash
curl -X PATCH 'https://your-project.supabase.co/rest/v1/tasks?id=eq.TASK_UUID' \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "status": "completed",
    "priority": "low"
  }'
```

#### Postman:
- **Method**: `PATCH`
- **URL**: `https://your-project.supabase.co/rest/v1/tasks?id=eq.TASK_UUID`
- **Headers**:
  ```
  apikey: YOUR_SUPABASE_ANON_KEY
  Authorization: Bearer YOUR_SUPABASE_ANON_KEY
  Content-Type: application/json
  Prefer: return=representation
  ```
- **Body** (raw JSON):
  ```json
  {
    "status": "completed",
    "priority": "low",
    "description": "Updated description"
  }
  ```

---

### 4. DELETE - Xóa Task

#### cURL:
```bash
curl -X DELETE 'https://your-project.supabase.co/rest/v1/tasks?id=eq.TASK_UUID' \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

#### Postman:
- **Method**: `DELETE`
- **URL**: `https://your-project.supabase.co/rest/v1/tasks?id=eq.TASK_UUID`
- **Headers**:
  ```
  apikey: YOUR_SUPABASE_ANON_KEY
  Authorization: Bearer YOUR_SUPABASE_ANON_KEY
  ```

---

### 5. Categories API

#### Tạo Category:
```bash
curl -X POST 'https://your-project.supabase.co/rest/v1/categories' \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "YOUR_USER_UUID",
    "name": "Work",
    "color": "#3B82F6"
  }'
```

#### Lấy Categories:
```bash
curl -X GET 'https://your-project.supabase.co/rest/v1/categories?user_id=eq.YOUR_USER_UUID&select=*' \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

---

### 6. Task-Category Relationships

#### Link Task với Category:
```bash
curl -X POST 'https://your-project.supabase.co/rest/v1/task_categories' \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "TASK_UUID",
    "category_id": "CATEGORY_UUID"
  }'
```

#### Lấy Tasks với Categories (Join):
```bash
curl -X GET 'https://your-project.supabase.co/rest/v1/tasks?select=*,task_categories(category_id,categories(*))' \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

---

### Lưu ý về Authentication

Để test các API với quyền của user cụ thể (không phải anon key), bạn cần:

1. **Lấy User Access Token** sau khi login:
```bash
curl -X POST 'https://your-project.supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your-password"
  }'
```

2. **Sử dụng Access Token** trong requests:
```
Authorization: Bearer USER_ACCESS_TOKEN
```

### Postman Collection

Để tiện test, bạn có thể tạo Postman Collection với:

1. **Environment Variables**:
   - `SUPABASE_URL`: https://your-project.supabase.co
   - `SUPABASE_ANON_KEY`: your-anon-key
   - `USER_TOKEN`: user-access-token (sau khi login)

2. **Pre-request Script** (tự động add headers):
```javascript
pm.request.headers.add({
  key: 'apikey',
  value: pm.environment.get('SUPABASE_ANON_KEY')
});
pm.request.headers.add({
  key: 'Authorization',
  value: 'Bearer ' + pm.environment.get('SUPABASE_ANON_KEY')
});
```

---

## Kết Luận

ConBi là một ví dụ điển hình về việc sử dụng BaaS (Backend-as-a-Service) để xây dựng ứng dụng web nhanh chóng. Với Supabase, developers có thể tập trung vào logic nghiệp vụ và UI/UX mà không cần lo lắng về infrastructure và backend code phức tạp.

**Ưu điểm:**
- Phát triển nhanh
- Chi phí thấp (free tier)
- Dễ scale
- Bảo mật tốt với Row Level Security

**Nhược điểm:**
- Phụ thuộc vào third-party service
- Giới hạn customization ở mức độ nhất định
- Vendor lock-in (tuy nhiên Supabase là open-source nên có thể self-host)

## Tác Giả

**Nhóm 3** - Cloud Computing Class
- Đề tài: SaaS/PaaS Project với Supabase
- Ứng dụng: ConBi Task Manager

---

*Dự án này được tạo cho mục đích học tập và thực hành về Cloud Computing.*
