# Marketing Automation Platform - Vercel Ready

A comprehensive full-stack marketing automation platform optimized for Vercel deployment. Manage and automate paid advertising campaigns across Google Ads, Facebook Ads, LinkedIn Ads, and more.

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/marketing-automation-vercel)

## ✨ Features

- **Multi-Platform Campaign Management**: Google Ads, Facebook, LinkedIn, Twitter, TikTok
- **Real-time Performance Dashboard**: Live metrics and KPI tracking
- **Automated Optimization**: AI-driven bid adjustments and budget management
- **Serverless Architecture**: Optimized for Vercel's serverless functions
- **MongoDB Integration**: Scalable database with connection pooling
- **Modern UI**: React/Next.js with Tailwind CSS and Recharts

## 🏗️ Architecture

### Vercel Serverless Functions
```
pages/api/
├── campaigns/
│   ├── index.js          # GET/POST campaigns
│   └── [id].js           # GET/PUT/DELETE specific campaign
├── analytics/
│   └── overview.js       # Dashboard analytics
└── automation/
    └── optimize.js       # Campaign optimization
```

### Frontend (Next.js)
```
pages/
├── index.js              # Main dashboard
├── _app.js              # App wrapper
└── api/                 # Serverless API routes

components/              # Reusable components
lib/                    # Database models and utilities
styles/                 # Tailwind CSS styles
```

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Vercel CLI (optional)

### Setup
1. **Clone and install**
   ```bash
   git clone <your-repo>
   cd marketing-automation-vercel
   npm install
   ```

2. **Environment Variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Dashboard: http://localhost:3000
   - API: http://localhost:3000/api

## 🌐 Vercel Deployment

### Option 1: Deploy Button
Click the "Deploy with Vercel" button above and follow the setup wizard.

### Option 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
# ... add other env vars

# Deploy to production
vercel --prod
```

### Option 3: Git Integration
1. Push to GitHub/GitLab
2. Connect repository in Vercel dashboard
3. Add environment variables
4. Deploy automatically on push

## ⚙️ Environment Variables

Set these in your Vercel dashboard or `.env.local`:

### Required
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
```

### Optional (for platform integrations)
```env
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
```

## 📊 API Endpoints

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/[id]` - Get specific campaign
- `PUT /api/campaigns/[id]` - Update campaign
- `DELETE /api/campaigns/[id]` - Delete campaign

### Analytics
- `GET /api/analytics/overview?range=7d` - Dashboard overview

### Automation
- `POST /api/automation/optimize` - Optimize campaigns

## 🗄️ Database Schema

### Campaign Model
```javascript
{
  name: String,
  type: 'google_ads' | 'facebook_ads' | 'linkedin_ads',
  status: 'active' | 'paused' | 'completed',
  budget: {
    daily: Number,
    total: Number,
    spent: Number
  },
  performance: {
    impressions: Number,
    clicks: Number,
    conversions: Number,
    cost: Number,
    revenue: Number
  },
  // ... more fields
}
```

## 🎨 UI Components

### Dashboard Features
- **Real-time Metrics Cards**: Spend, Revenue, ROAS, CTR
- **Interactive Charts**: Performance over time, platform distribution
- **Campaign Table**: Sortable and filterable campaign list
- **Quick Actions**: One-click optimization and controls

### Responsive Design
- Mobile-first approach
- Tailwind CSS for styling
- Dark mode ready
- Accessible components

## 🔧 Customization

### Adding New Platforms
1. Update campaign type enum in `lib/models/Campaign.js`
2. Add platform colors in dashboard
3. Implement platform-specific API integrations

### Custom Metrics
1. Extend performance schema in Campaign model
2. Update analytics API to calculate new metrics
3. Add metric cards to dashboard

### Automation Rules
1. Extend automation API endpoints
2. Add rule configuration UI
3. Implement rule execution logic

## 📈 Performance Optimizations

### Vercel Optimizations
- **Static Generation**: Pre-rendered pages where possible
- **API Routes**: Serverless functions with optimized cold starts
- **Database Connection Pooling**: Cached MongoDB connections
- **SWR Data Fetching**: Client-side caching and revalidation

### Frontend Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **CSS Optimization**: Tailwind CSS purging
- **Bundle Analysis**: Built-in Next.js analyzer

## 🛡️ Security

- **Environment Variables**: Secure credential storage
- **API Validation**: Input sanitization and validation
- **CORS Configuration**: Proper cross-origin setup
- **JWT Authentication**: Secure API access (when implemented)

## 📱 Mobile Experience

- Fully responsive design
- Touch-friendly interactions
- Optimized charts and tables
- Progressive Web App ready

## 🚀 Production Checklist

- [ ] Set all required environment variables
- [ ] Configure MongoDB connection string
- [ ] Test API endpoints
- [ ] Verify chart rendering
- [ ] Check mobile responsiveness
- [ ] Set up monitoring (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

- **Documentation**: README.md (this file)
- **Issues**: GitHub Issues
- **Vercel Docs**: https://vercel.com/docs

## 📄 License

MIT License - see LICENSE file for details.

## 🎯 Next Steps

After deployment:
1. **Add Real API Integrations**: Connect to actual ad platforms
2. **Implement Authentication**: Add user login and permissions
3. **Set Up Monitoring**: Add error tracking and analytics
4. **Create Automated Reports**: Email and Slack notifications
5. **Add More Platforms**: Expand beyond current integrations

---

**Ready to deploy?** Click the Vercel button above or follow the deployment instructions!