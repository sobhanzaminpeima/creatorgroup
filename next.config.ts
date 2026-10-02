import type {NextConfig} from 'next';
import {resolve} from 'node:path';
const nextConfig:NextConfig={
 experimental:{cpus:1},
 webpack(config,{webpack}){config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^cloudflare:workers$/, (resource:{request:string})=>{resource.request=resolve(process.cwd(),'lib/hostinger-workers.ts')}));return config;},
};
export default nextConfig;
