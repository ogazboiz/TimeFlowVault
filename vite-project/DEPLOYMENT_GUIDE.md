# 🚀 TimeFlowVault Vercel Deployment Guide

## Prerequisites
- Vercel account (free tier available)
- GitHub repository with your project
- Node.js 18.x or 20.x installed locally

## Step 1: Prepare Your Project

### 1.1 Build Locally (Optional but Recommended)
```bash
cd vite-project
npm install
npm run build
```

This will create a `dist` folder with your built project.

### 1.2 Verify Build Output
The build should complete without errors and create:
- `dist/index.html`
- `dist/assets/` folder with JS/CSS files

## Step 2: Deploy to Vercel

### 2.1 Connect Your Repository
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository containing your project

### 2.2 Configure Project Settings
Use these settings:

- **Framework Preset**: `Vite`
- **Root Directory**: `vite-project` (if your project is in a subfolder)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.3 Add Environment Variables
Go to Project Settings → Environment Variables and add:

#### Required Variables:
```
VITE_CONTRACT_ADDRESS=0x189C49B169DE610994b7CB4A185907cf84933614
VITE_LISK_CHAIN_ID=0x106A
VITE_LISK_CHAIN_NAME=Lisk Sepolia Testnet
VITE_LISK_RPC_URL=https://rpc.sepolia-api.lisk.com
VITE_LISK_BLOCK_EXPLORER=https://sepolia-blockscout.lisk.com
```

#### Optional Variables:
```
VITE_APP_NAME=TimeFlowVault
VITE_APP_DESCRIPTION=Money Streaming + DeFi Vault on Lisk Blockchain
VITE_APP_VERSION=1.0.0
```

### 2.4 Deploy
Click "Deploy" and wait for the build to complete.

## Step 3: Post-Deployment

### 3.1 Verify Deployment
- Check that your app loads correctly
- Test wallet connection
- Verify contract interaction

### 3.2 Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### 3.3 Environment Variables for Different Environments
You can set different values for:
- **Production**: Live site
- **Preview**: Pull request deployments
- **Development**: Local development

## Troubleshooting

### Build Errors
- Check Node.js version (use 18.x or 20.x)
- Verify all dependencies are in `package.json`
- Check for syntax errors in your code

### Runtime Errors
- Verify environment variables are set correctly
- Check browser console for errors
- Ensure contract address is correct

### Performance Issues
- Enable Vercel Analytics
- Use Vercel's Edge Functions if needed
- Optimize bundle size

## Monitoring & Analytics

### Vercel Analytics
1. Go to Project Settings → Analytics
2. Enable Vercel Analytics
3. View performance metrics

### Error Tracking
- Monitor Vercel Function logs
- Set up error tracking (e.g., Sentry)
- Check browser console errors

## Security Considerations

### Environment Variables
- Never commit sensitive data to your repository
- Use Vercel's environment variable system
- Rotate keys regularly

### Headers
The `vercel.json` file includes security headers:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection

## Support

If you encounter issues:
1. Check Vercel documentation
2. Review build logs in Vercel dashboard
3. Check GitHub issues for similar problems
4. Contact Vercel support if needed

## Success Checklist

- [ ] Project builds locally without errors
- [ ] Repository connected to Vercel
- [ ] Environment variables configured
- [ ] Deployment successful
- [ ] App loads correctly in browser
- [ ] Wallet connection works
- [ ] Contract interaction functional
- [ ] Custom domain configured (if desired)
- [ ] Analytics enabled (optional)

🎉 Congratulations! Your TimeFlowVault is now deployed on Vercel!
