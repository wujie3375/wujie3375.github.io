import {fileURLToPath} from 'node:url';
import path from 'node:path';
export const projectDir=fileURLToPath(new URL('../',import.meta.url));
export const jsDir=path.dirname(projectDir.replace(/[\\/]$/,''));
export const vendorDir=path.join(jsDir,'vendor','three');
export const buildDir=process.env.AGN_TRIPLE_BUILD_DIR||'D:/GitHub/no use/agn-triple-build';
