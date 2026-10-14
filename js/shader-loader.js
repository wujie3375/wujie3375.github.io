/* 原生源码的 GLSL 读取缓存。发布构建用相同原文替换此模块，不改写 shader。 */
const pending = new Map();

export function loadShader(project, name, revision = '') {
  const url = new URL(`./${project}/src/shaders/${name}`, import.meta.url);
  if (revision) url.searchParams.set('v', revision);
  const key = url.href;
  if (!pending.has(key)) {
    const request = fetch(url).then(response => {
      if (!response.ok) throw new Error(`Shader not found: ${project}/${name}`);
      return response.text();
    }).catch(error => { pending.delete(key); throw error; });
    pending.set(key, request);
  }
  return pending.get(key);
}
