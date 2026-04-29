import { initDB } from './db';
import { UserModel } from './models/User';
import { TermModel } from './models/Term';

async function seed() {
  await initDB();
  console.log('Seeding database...');

  // Create admin user
  const admin = UserModel.create('admin', 'admin123', 'admin');
  console.log('Created admin user: admin / admin123');

  // Create contributor user
  const contributor = UserModel.create('contributor', 'contrib123', 'contributor');
  console.log('Created contributor user: contributor / contrib123');

  // Create viewer user
  const viewer = UserModel.create('viewer', 'viewer123', 'viewer');
  console.log('Created viewer user: viewer / viewer123');

  // Sample terms
  const terms = [
    { question: '什么是 RESTful API？', answer: 'RESTful API 是一种基于 REST（Representational State Transfer）架构风格设计的 API。它使用 HTTP 方法（GET、POST、PUT、DELETE）来操作资源，具有无状态性、统一接口、可缓存等特点。', category: 'API 设计', tags: ['REST', 'API', 'HTTP'] },
    { question: '什么是 TypeScript 泛型？', answer: 'TypeScript 泛型（Generics）允许创建可复用的组件，这些组件可以支持多种类型而不是单一类型。通过 <T> 语法定义类型参数，在使用时传入具体类型。', category: 'TypeScript', tags: ['TypeScript', '泛型', '类型'] },
    { question: '什么是 JWT？', answer: 'JWT（JSON Web Token）是一种开放标准（RFC 7519），用于在各方之间安全地传输信息。JWT 由三部分组成：Header（头部）、Payload（载荷）、Signature（签名），用点号分隔。', category: '认证', tags: ['JWT', '认证', '安全'] },
    { question: '什么是 SQL 注入？如何防止？', answer: 'SQL 注入是一种安全漏洞，攻击者通过在输入中插入恶意 SQL 代码来操纵数据库查询。防止方法：使用参数化查询、ORM 框架、输入验证、最小权限原则。', category: '安全', tags: ['SQL注入', '安全', '数据库'] },
    { question: '什么是 WebSocket？', answer: 'WebSocket 是一种在单个 TCP 连接上进行全双工通信的协议。与 HTTP 不同，WebSocket 允许服务器主动向客户端推送数据，适用于实时应用如聊天、股票行情等。', category: '网络', tags: ['WebSocket', '实时通信', '网络'] },
    { question: '什么是 Docker 容器？', answer: 'Docker 容器是一个轻量级、可移植的软件包，包含运行应用所需的一切：代码、运行时、系统工具、库和设置。容器与虚拟机不同，它们共享宿主机的操作系统内核。', category: 'DevOps', tags: ['Docker', '容器', 'DevOps'] },
    { question: '什么是 Redis？', answer: 'Redis（Remote Dictionary Server）是一个开源的内存数据结构存储系统，可用作数据库、缓存和消息代理。支持字符串、哈希、列表、集合、有序集合等数据结构。', category: '数据库', tags: ['Redis', '缓存', '数据库'] },
    { question: '什么是 GraphQL？', answer: 'GraphQL 是一种用于 API 的查询语言和运行时。与 REST 不同，客户端可以精确指定需要的数据，避免了过度获取或不足获取的问题。由 Facebook 开发。', category: 'API 设计', tags: ['GraphQL', 'API', '查询语言'] },
    { question: '什么是微服务架构？', answer: '微服务架构是一种将应用构建为一组小型、独立部署的服务的方法。每个服务运行在自己的进程中，通过轻量级机制（通常是 HTTP API）通信。各服务可以使用不同的技术栈。', category: '架构', tags: ['微服务', '架构', '分布式'] },
    { question: '什么是 CI/CD？', answer: 'CI/CD（持续集成/持续部署）是一种软件开发实践。CI 指频繁地将代码集成到共享仓库并自动测试；CD 指自动化地将通过测试的代码部署到生产环境。', category: 'DevOps', tags: ['CI/CD', 'DevOps', '自动化'] },
  ];

  for (const term of terms) {
    TermModel.create(term.question, term.answer, term.category, term.tags, admin.id);
  }

  console.log(`Created ${terms.length} sample terms`);
  console.log('Seed complete!');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
