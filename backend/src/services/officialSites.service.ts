export interface OfficialSite {
  id: string;
  name: string;
  domain: string;
  url: string;
  title: string;
  snippet: string;
  category?: 'general' | 'it' | 'science';
  aliases: string[];
}

/**
 * Curated knowledge base of verified official websites for frameworks, languages,
 * platforms, developer tooling, web services, and consumer applications.
 */
export const KNOWN_OFFICIAL_SITES: OfficialSite[] = [
  // Web Frameworks & Libraries
  {
    id: 'react',
    name: 'React',
    domain: 'react.dev',
    url: 'https://react.dev/',
    title: 'React — The library for web and native user interfaces',
    snippet:
      'The official React documentation and library for web and native user interfaces. Build user interfaces out of individual pieces called components written in JavaScript.',
    category: 'it',
    aliases: ['reactjs', 'react js', 'react.js', 'reactjs.org', 'react.dev'],
  },
  {
    id: 'tailwindcss',
    name: 'Tailwind CSS',
    domain: 'tailwindcss.com',
    url: 'https://tailwindcss.com/',
    title: 'Tailwind CSS — Rapidly build modern websites without ever leaving your HTML',
    snippet:
      'A utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90 that can be composed to build any design, directly in your markup.',
    category: 'it',
    aliases: ['tailwind', 'tailwind css', 'tailwind-css', 'tailwindcss.com'],
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    domain: 'nextjs.org',
    url: 'https://nextjs.org/',
    title: 'Next.js by Vercel — The React Framework for the Web',
    snippet:
      'Used by some of the worlds largest companies, Next.js enables you to create full-stack Web applications by extending the latest React features.',
    category: 'it',
    aliases: ['next js', 'next.js', 'nextjs.org'],
  },
  {
    id: 'vue',
    name: 'Vue.js',
    domain: 'vuejs.org',
    url: 'https://vuejs.org/',
    title: 'Vue.js — The Progressive JavaScript Framework',
    snippet:
      'An approachable, performant and versatile framework for building web user interfaces. Progressive framework for modern front-end web development.',
    category: 'it',
    aliases: ['vuejs', 'vue js', 'vue.js', 'vuejs.org'],
  },
  {
    id: 'angular',
    name: 'Angular',
    domain: 'angular.dev',
    url: 'https://angular.dev/',
    title: 'Angular — The web development platform to build fast, reliable applications',
    snippet:
      'The modern web development platform for building fast, reliable, and scalable applications by Google.',
    category: 'it',
    aliases: ['angularjs', 'angular.dev', 'angular.io', 'angular framework'],
  },
  {
    id: 'svelte',
    name: 'Svelte',
    domain: 'svelte.dev',
    url: 'https://svelte.dev/',
    title: 'Svelte — Cybernetically enhanced web apps',
    snippet:
      'Svelte is a radical new approach to building user interfaces. It runs at build time, converting your components into highly efficient imperative code.',
    category: 'it',
    aliases: ['sveltejs', 'svelte js', 'svelte.js', 'svelte.dev'],
  },
  {
    id: 'vite',
    name: 'Vite',
    domain: 'vite.dev',
    url: 'https://vite.dev/',
    title: 'Vite — Next Generation Frontend Tooling',
    snippet:
      'Next generation frontend tooling. Get ready for a development environment that can finally catch up with you with instant server start and lightning fast HMR.',
    category: 'it',
    aliases: ['vitejs', 'vite js', 'vite.js', 'vite.dev', 'vitejs.dev'],
  },
  {
    id: 'astro',
    name: 'Astro',
    domain: 'astro.build',
    url: 'https://astro.build/',
    title: 'Astro — The web framework for content-driven websites',
    snippet:
      'Astro is the web framework for building fast, content-driven websites. Pull content from anywhere and serve it fast with Astro islands.',
    category: 'it',
    aliases: ['astrojs', 'astro.build', 'astro framework'],
  },
  {
    id: 'nuxt',
    name: 'Nuxt',
    domain: 'nuxt.com',
    url: 'https://nuxt.com/',
    title: 'Nuxt: The Intuitive Vue Framework',
    snippet:
      'Nuxt is an open source framework that makes web development intuitive and powerful. Create performant and production-grade full-stack web apps with Vue.',
    category: 'it',
    aliases: ['nuxtjs', 'nuxt.js', 'nuxt js', 'nuxt.com'],
  },
  {
    id: 'remix',
    name: 'Remix',
    domain: 'remix.run',
    url: 'https://remix.run/',
    title: 'Remix — Build Better Websites',
    snippet:
      'Remix is a full stack web framework that lets you focus on the user interface and work back through web standards to deliver a fast, slick, and resilient user experience.',
    category: 'it',
    aliases: ['remix run', 'remixjs', 'remix.run'],
  },
  {
    id: 'express',
    name: 'Express',
    domain: 'expressjs.com',
    url: 'https://expressjs.com/',
    title: 'Express — Node.js web application framework',
    snippet:
      'Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.',
    category: 'it',
    aliases: ['expressjs', 'express js', 'express.js', 'expressjs.com'],
  },
  {
    id: 'django',
    name: 'Django',
    domain: 'djangoproject.com',
    url: 'https://www.djangoproject.com/',
    title: 'Django — The web framework for perfectionists with deadlines',
    snippet:
      'Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design.',
    category: 'it',
    aliases: ['djangoproject', 'django python', 'djangoproject.com'],
  },
  {
    id: 'flask',
    name: 'Flask',
    domain: 'flask.palletsprojects.com',
    url: 'https://flask.palletsprojects.com/',
    title: 'Flask — Pallets Web Project',
    snippet:
      'Flask is a lightweight WSGI web application framework in Python. It is designed to make getting started quick and easy, with the ability to scale up to complex applications.',
    category: 'it',
    aliases: ['flask python', 'flask web', 'palletsprojects flask'],
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    domain: 'fastapi.tiangolo.com',
    url: 'https://fastapi.tiangolo.com/',
    title: 'FastAPI — High performance, easy to learn, fast to code',
    snippet:
      'FastAPI framework, high performance, easy to learn, fast to code, ready for production. Based on standard Python type hints.',
    category: 'it',
    aliases: ['fast api', 'fastapi python', 'tiangolo fastapi'],
  },
  {
    id: 'laravel',
    name: 'Laravel',
    domain: 'laravel.com',
    url: 'https://laravel.com/',
    title: 'Laravel — The PHP Framework For Web Artisans',
    snippet:
      'Laravel is a web application framework with expressive, elegant syntax. We’ve already laid the foundation — freeing you to create without sweating the small things.',
    category: 'it',
    aliases: ['laravel php', 'laravel.com', 'laravel framework'],
  },
  {
    id: 'spring',
    name: 'Spring',
    domain: 'spring.io',
    url: 'https://spring.io/',
    title: 'Spring — Level up your Java code',
    snippet:
      'Spring makes Java simple, modern, productive, reactive, and cloud-ready. Home of Spring Boot and the Spring framework.',
    category: 'it',
    aliases: ['spring boot', 'springboot', 'spring framework', 'spring.io'],
  },
  {
    id: 'rails',
    name: 'Ruby on Rails',
    domain: 'rubyonrails.org',
    url: 'https://rubyonrails.org/',
    title: 'Ruby on Rails — A web-app framework that includes everything needed to build fantastic applications',
    snippet:
      'Ruby on Rails is a full-stack framework optimized for programmer happiness and sustainable productivity.',
    category: 'it',
    aliases: ['ruby on rails', 'rubyonrails', 'rubyonrails.org'],
  },
  {
    id: 'dotnet',
    name: '.NET',
    domain: 'dotnet.microsoft.com',
    url: 'https://dotnet.microsoft.com/',
    title: '.NET | Free. Cross-platform. Open source.',
    snippet:
      'Free. Cross-platform. Open source. A developer platform by Microsoft for building all your apps: web, mobile, desktop, games, and IoT.',
    category: 'it',
    aliases: ['dotnet', '.net', 'asp.net', 'microsoft net', 'dotnet core'],
  },

  // Programming Languages & Runtimes
  {
    id: 'python',
    name: 'Python',
    domain: 'python.org',
    url: 'https://www.python.org/',
    title: 'Welcome to Python.org',
    snippet:
      'The official home of the Python Programming Language. Find downloads, documentation, community news, tutorials, and ecosystem resources.',
    category: 'it',
    aliases: ['python3', 'python lang', 'python language', 'python.org'],
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    domain: 'typescriptlang.org',
    url: 'https://www.typescriptlang.org/',
    title: 'TypeScript: JavaScript With Syntax For Types',
    snippet:
      'TypeScript extends JavaScript by adding types to the language. TypeScript speeds up your development experience by catching errors and providing fixes before you even run your code.',
    category: 'it',
    aliases: ['ts', 'typescriptlang', 'typescript lang', 'typescriptlang.org'],
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    domain: 'nodejs.org',
    url: 'https://nodejs.org/',
    title: 'Node.js — Run JavaScript Everywhere',
    snippet:
      'Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser.',
    category: 'it',
    aliases: ['node', 'nodejs', 'node js', 'node.js', 'nodejs.org'],
  },
  {
    id: 'bun',
    name: 'Bun',
    domain: 'bun.sh',
    url: 'https://bun.sh/',
    title: 'Bun — A fast all-in-one JavaScript runtime',
    snippet:
      'Develop, test, run, and bundle JavaScript & TypeScript projects—all with Bun. Bun is an all-in-one JavaScript runtime & toolkit designed for speed.',
    category: 'it',
    aliases: ['bunjs', 'bun js', 'bun runtime', 'bun.sh'],
  },
  {
    id: 'deno',
    name: 'Deno',
    domain: 'deno.com',
    url: 'https://deno.com/',
    title: 'Deno — The next-generation JavaScript runtime',
    snippet:
      'Deno is the modern runtime for TypeScript and JavaScript with built-in security, standard libraries, and web-standard APIs.',
    category: 'it',
    aliases: ['denojs', 'deno js', 'deno.land', 'deno.com'],
  },
  {
    id: 'rust',
    name: 'Rust',
    domain: 'rust-lang.org',
    url: 'https://www.rust-lang.org/',
    title: 'Rust Programming Language',
    snippet:
      'A language empowering everyone to build reliable and efficient software. Blazingly fast and memory-efficient with no runtime or garbage collector.',
    category: 'it',
    aliases: ['rustlang', 'rust lang', 'rust programming language', 'rust-lang.org'],
  },
  {
    id: 'golang',
    name: 'Go',
    domain: 'go.dev',
    url: 'https://go.dev/',
    title: 'Build simple, secure, scalable systems with Go',
    snippet:
      'Go is an open source programming language supported by Google with built-in concurrency and a robust standard library.',
    category: 'it',
    aliases: ['golang', 'go lang', 'go language', 'go.dev', 'golang.org'],
  },
  {
    id: 'php',
    name: 'PHP',
    domain: 'php.net',
    url: 'https://www.php.net/',
    title: 'PHP: Hypertext Preprocessor',
    snippet:
      'PHP is a popular general-purpose scripting language that is especially suited to web development. Fast, flexible and pragmatic.',
    category: 'it',
    aliases: ['php lang', 'php language', 'php.net'],
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    domain: 'kotlinlang.org',
    url: 'https://kotlinlang.org/',
    title: 'Kotlin Programming Language',
    snippet:
      'A modern programming language that makes developers happier. Developed by JetBrains for multiplatform and Android development.',
    category: 'it',
    aliases: ['kotlinlang', 'kotlin lang', 'kotlinlang.org'],
  },
  {
    id: 'swift',
    name: 'Swift',
    domain: 'swift.org',
    url: 'https://www.swift.org/',
    title: 'Swift.org — The Swift Programming Language',
    snippet:
      'Swift is a powerful and intuitive programming language for iOS, iPadOS, macOS, tvOS, watchOS, and beyond.',
    category: 'it',
    aliases: ['swiftlang', 'swift lang', 'swift language', 'swift.org'],
  },

  // Databases & Backend Platforms
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    domain: 'postgresql.org',
    url: 'https://www.postgresql.org/',
    title: 'PostgreSQL: The World\'s Most Advanced Open Source Relational Database',
    snippet:
      'PostgreSQL is a powerful, open source object-relational database system with over 35 years of active development.',
    category: 'it',
    aliases: ['postgres', 'postgresql', 'psql', 'postgresql.org'],
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    domain: 'mongodb.com',
    url: 'https://www.mongodb.com/',
    title: 'MongoDB: The Developer Data Platform',
    snippet:
      'Get your ideas to market faster with a developer data platform built on the leading modern document database.',
    category: 'it',
    aliases: ['mongo', 'mongodb', 'mongodb.com'],
  },
  {
    id: 'redis',
    name: 'Redis',
    domain: 'redis.io',
    url: 'https://redis.io/',
    title: 'Redis — The Real-time Data Platform',
    snippet:
      'Redis is an open source, in-memory data store used by millions of developers as a database, cache, streaming engine, and message broker.',
    category: 'it',
    aliases: ['redis.io', 'redis cache', 'redis database'],
  },
  {
    id: 'supabase',
    name: 'Supabase',
    domain: 'supabase.com',
    url: 'https://supabase.com/',
    title: 'Supabase | The Open Source Firebase Alternative',
    snippet:
      'Build in a weekend, scale to millions. Postgres database, Authentication, Instant APIs, Realtime, Edge Functions, and Vector storage.',
    category: 'it',
    aliases: ['supabase.com', 'supabase database'],
  },
  {
    id: 'firebase',
    name: 'Firebase',
    domain: 'firebase.google.com',
    url: 'https://firebase.google.com/',
    title: 'Firebase — Google\'s Mobile and Web App Development Platform',
    snippet:
      'Firebase is an app development platform that helps you build and grow apps and games users love. Backed by Google.',
    category: 'it',
    aliases: ['firebase.google.com', 'google firebase'],
  },
  {
    id: 'prisma',
    name: 'Prisma',
    domain: 'prisma.io',
    url: 'https://www.prisma.io/',
    title: 'Prisma | Next-generation ORM for Node.js & TypeScript',
    snippet:
      'Prisma unlocks a new level of developer experience when working with databases thanks to its intuitive data model, automated migrations, type-safety & auto-completion.',
    category: 'it',
    aliases: ['prisma orm', 'prisma.io'],
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    domain: 'graphql.org',
    url: 'https://graphql.org/',
    title: 'GraphQL | A query language for your API',
    snippet:
      'GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data.',
    category: 'it',
    aliases: ['graphql.org', 'graph ql'],
  },

  // DevOps, Hosting & Cloud
  {
    id: 'docker',
    name: 'Docker',
    domain: 'docker.com',
    url: 'https://www.docker.com/',
    title: 'Docker: Accelerated Container Application Development',
    snippet:
      'Docker helps developers build, share, run, and verify applications anywhere — without tedious environment configuration or management.',
    category: 'it',
    aliases: ['docker hub', 'docker.com', 'docker container'],
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    domain: 'kubernetes.io',
    url: 'https://kubernetes.io/',
    title: 'Kubernetes — Production-Grade Container Orchestration',
    snippet:
      'Automated container deployment, scaling, and management across clusters of hosts.',
    category: 'it',
    aliases: ['k8s', 'kubernetes.io', 'kube'],
  },
  {
    id: 'github',
    name: 'GitHub',
    domain: 'github.com',
    url: 'https://github.com/',
    title: 'GitHub: Let’s build from here',
    snippet:
      'GitHub is where over 100 million developers shape the future of software, together. Contribute to open source, manage Git repositories, and collaborate.',
    category: 'it',
    aliases: ['github.com', 'git hub'],
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    domain: 'gitlab.com',
    url: 'https://gitlab.com/',
    title: 'GitLab: The One DevOps Platform',
    snippet:
      'GitLab is the open DevOps platform delivered as a single application with comprehensive CI/CD, security, and project management.',
    category: 'it',
    aliases: ['gitlab.com', 'git lab'],
  },
  {
    id: 'npm',
    name: 'npm',
    domain: 'npmjs.com',
    url: 'https://www.npmjs.com/',
    title: 'npm | Build amazing things',
    snippet:
      'The package manager for JavaScript and the world’s largest software registry. Discover packages and manage dependencies for modern web applications.',
    category: 'it',
    aliases: ['npmjs', 'npmjs.com', 'npm registry', 'npm package'],
  },
  {
    id: 'pypi',
    name: 'PyPI',
    domain: 'pypi.org',
    url: 'https://pypi.org/',
    title: 'PyPI · The Python Package Index',
    snippet:
      'The Python Package Index (PyPI) is a repository of software for the Python programming language.',
    category: 'it',
    aliases: ['pypi.org', 'pip pypi', 'python package index'],
  },
  {
    id: 'stackoverflow',
    name: 'Stack Overflow',
    domain: 'stackoverflow.com',
    url: 'https://stackoverflow.com/',
    title: 'Stack Overflow - Where Developers Learn, Share, & Build Careers',
    snippet:
      'Stack Overflow is the largest, most trusted online community for developers to learn, share their programming knowledge, and build their careers.',
    category: 'it',
    aliases: ['stack overflow', 'stackoverflow.com'],
  },
  {
    id: 'vercel',
    name: 'Vercel',
    domain: 'vercel.com',
    url: 'https://vercel.com/',
    title: 'Vercel: Build and deploy the best Web experiences',
    snippet:
      'Vercel Frontend Cloud gives developers frameworks, workflows, and infrastructure to build a faster, more personalized Web.',
    category: 'it',
    aliases: ['vercel.com', 'vercel cloud'],
  },
  {
    id: 'netlify',
    name: 'Netlify',
    domain: 'netlify.com',
    url: 'https://www.netlify.com/',
    title: 'Netlify: Develop & deploy scalable web apps',
    snippet:
      'A powerful serverless platform with an intuitive Git-based workflow. Automated deployments, shareable previews, edge functions, and hosting.',
    category: 'it',
    aliases: ['netlify.com'],
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    domain: 'cloudflare.com',
    url: 'https://www.cloudflare.com/',
    title: 'Cloudflare - The Web Performance & Security Company',
    snippet:
      'Make applications and websites faster, more secure, and more reliable with Cloudflare global network, DDoS protection, and DNS.',
    category: 'it',
    aliases: ['cloudflare.com'],
  },
  {
    id: 'aws',
    name: 'AWS',
    domain: 'aws.amazon.com',
    url: 'https://aws.amazon.com/',
    title: 'Amazon Web Services (AWS) - Cloud Computing Services',
    snippet:
      'Amazon Web Services offers reliable, scalable, and inexpensive cloud computing services with computing power, storage, and databases.',
    category: 'it',
    aliases: ['amazon web services', 'aws cloud', 'aws.amazon.com'],
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    domain: 'azure.microsoft.com',
    url: 'https://azure.microsoft.com/',
    title: 'Cloud Computing Services | Microsoft Azure',
    snippet:
      'Invent with purpose, realize cost savings, and make your organization more efficient with Microsoft Azure cloud computing services.',
    category: 'it',
    aliases: ['azure cloud', 'microsoft azure', 'azure.com'],
  },
  {
    id: 'gcp',
    name: 'Google Cloud',
    domain: 'cloud.google.com',
    url: 'https://cloud.google.com/',
    title: 'Cloud Computing Services | Google Cloud',
    snippet:
      'Meet your business challenges head on with cloud computing services from Google Cloud, including AI, data analytics, and scalable compute.',
    category: 'it',
    aliases: ['google cloud', 'gcp', 'google cloud platform', 'cloud.google.com'],
  },

  // Developer Tools & Editors
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    domain: 'code.visualstudio.com',
    url: 'https://code.visualstudio.com/',
    title: 'Visual Studio Code - Code Editing. Redefined',
    snippet:
      'Visual Studio Code is a lightweight code editor redefined and optimized for building and debugging modern web and cloud applications.',
    category: 'it',
    aliases: ['vscode', 'vs code', 'visual studio code'],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    domain: 'cursor.com',
    url: 'https://www.cursor.com/',
    title: 'Cursor - The AI Code Editor',
    snippet:
      'Built to make you extraordinarily productive, Cursor is the best way to code with AI, built on a fork of VS Code.',
    category: 'it',
    aliases: ['cursor ai', 'cursor editor', 'cursor.sh', 'cursor.com'],
  },
  {
    id: 'postman',
    name: 'Postman',
    domain: 'postman.com',
    url: 'https://www.postman.com/',
    title: 'Postman API Platform | Sign Up for Free',
    snippet:
      'Postman is an API platform for building and using APIs. Postman simplifies each step of the API lifecycle and streamlines collaboration.',
    category: 'it',
    aliases: ['postman.com', 'postman api'],
  },

  // AI & Machine Learning Platforms
  {
    id: 'openai',
    name: 'OpenAI',
    domain: 'openai.com',
    url: 'https://openai.com/',
    title: 'OpenAI',
    snippet:
      'OpenAI is an AI research and deployment company. Creators of ChatGPT, GPT-4, and DALL-E with a mission to benefit all of humanity.',
    category: 'it',
    aliases: ['openai.com'],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    domain: 'chatgpt.com',
    url: 'https://chatgpt.com/',
    title: 'ChatGPT — Get answers. Find inspiration. Be more productive.',
    snippet:
      'ChatGPT helps you get answers, find inspiration, write, summarize, and be more productive. Official conversational AI interface by OpenAI.',
    category: 'it',
    aliases: ['chat gpt', 'chatgpt.com', 'openai chatgpt'],
  },
  {
    id: 'claude',
    name: 'Claude',
    domain: 'claude.ai',
    url: 'https://claude.ai/',
    title: 'Claude — Anthropic\'s AI Assistant',
    snippet:
      'Talk with Claude, a next-generation AI assistant developed by Anthropic, designed to be helpful, harmless, and honest.',
    category: 'it',
    aliases: ['claude ai', 'claude.ai', 'anthropic claude', 'anthropic'],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    domain: 'gemini.google.com',
    url: 'https://gemini.google.com/',
    title: 'Gemini - Chat with AI from Google',
    snippet:
      'Chat with Gemini to supercharge your ideas, brainstorm, code, analyze data, and get things done with Google advanced AI.',
    category: 'it',
    aliases: ['google gemini', 'gemini ai', 'gemini.google.com'],
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    domain: 'huggingface.co',
    url: 'https://huggingface.co/',
    title: 'Hugging Face – The AI community building the future.',
    snippet:
      'The platform where the machine learning community collaborates on models, datasets, and applications.',
    category: 'it',
    aliases: ['hugging face', 'huggingface.co'],
  },

  // Web Services, Streaming & Social
  {
    id: 'spotify',
    name: 'Spotify',
    domain: 'spotify.com',
    url: 'https://www.spotify.com/',
    title: 'Spotify - Web Player: Music for everyone',
    snippet:
      'Spotify is a digital music, podcast, and video service that gives you access to millions of songs and other content from creators all over the world.',
    category: 'general',
    aliases: ['spotify.com', 'spotify web player', 'spotify music'],
  },
  {
    id: 'netflix',
    name: 'Netflix',
    domain: 'netflix.com',
    url: 'https://www.netflix.com/',
    title: 'Netflix - Watch TV Shows Online, Watch Movies Online',
    snippet:
      'Watch Netflix movies & TV shows online or stream right to your smart TV, game console, PC, Mac, mobile, tablet and more.',
    category: 'general',
    aliases: ['netflix.com', 'netflix streaming'],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    domain: 'youtube.com',
    url: 'https://www.youtube.com/',
    title: 'YouTube',
    snippet:
      'Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.',
    category: 'general',
    aliases: ['youtube.com', 'yt', 'you tube'],
  },
  {
    id: 'figma',
    name: 'Figma',
    domain: 'figma.com',
    url: 'https://www.figma.com/',
    title: 'Figma: The Collaborative Interface Design Tool',
    snippet:
      'Figma connects everyone in the design process so teams can deliver better products, faster. Design, prototype, and collaborate in real-time in the browser.',
    category: 'it',
    aliases: ['figma.com', 'figma design'],
  },
  {
    id: 'notion',
    name: 'Notion',
    domain: 'notion.so',
    url: 'https://www.notion.so/',
    title: 'Notion – Your connected workspace for wiki, docs & projects',
    snippet:
      'A new tool that blends your everyday work apps into one. It’s the all-in-one workspace for you and your team to write, plan, and get organized.',
    category: 'general',
    aliases: ['notion.so', 'notion app', 'notion workspace'],
  },
  {
    id: 'canva',
    name: 'Canva',
    domain: 'canva.com',
    url: 'https://www.canva.com/',
    title: 'Canva: Visual Suite for Everyone',
    snippet:
      'Canva makes design amazingly simple for everyone. Create presentations, social media graphics, posters, documents, and videos.',
    category: 'general',
    aliases: ['canva.com', 'canva design'],
  },
  {
    id: 'linear',
    name: 'Linear',
    domain: 'linear.app',
    url: 'https://linear.app/',
    title: 'Linear – A better way to build products',
    snippet:
      'Linear helps streamline software projects, sprints, tasks, and bug tracking. Built for high-performance software teams.',
    category: 'it',
    aliases: ['linear.app', 'linear app'],
  },
  {
    id: 'slack',
    name: 'Slack',
    domain: 'slack.com',
    url: 'https://slack.com/',
    title: 'Slack: Where work happens',
    snippet:
      'Slack is a new way to communicate with your team. It’s faster, better organized, and more secure than email.',
    category: 'general',
    aliases: ['slack.com', 'slack app'],
  },
  {
    id: 'discord',
    name: 'Discord',
    domain: 'discord.com',
    url: 'https://discord.com/',
    title: 'Discord | Group Chat That’s All Fun & Games',
    snippet:
      'Discord is great for playing games and chilling with friends, or even building a worldwide community. Voice, video, and text communication.',
    category: 'general',
    aliases: ['discord.com', 'discord app'],
  },
  {
    id: 'zoom',
    name: 'Zoom',
    domain: 'zoom.us',
    url: 'https://zoom.us/',
    title: 'Zoom Workplace: Video Conferencing, Web Conferencing, Webinars',
    snippet:
      'Modern enterprise video communications with an easy, reliable cloud platform for video and audio conferencing, collaboration, chat, and webinars.',
    category: 'general',
    aliases: ['zoom.us', 'zoom meeting'],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    domain: 'stripe.com',
    url: 'https://stripe.com/',
    title: 'Stripe | Financial Infrastructure for the Internet',
    snippet:
      'Online payment processing for internet businesses. Stripe is a suite of payment APIs that powers commerce for online businesses of all sizes.',
    category: 'it',
    aliases: ['stripe.com', 'stripe payments'],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    domain: 'paypal.com',
    url: 'https://www.paypal.com/',
    title: 'PayPal: Digital Wallets, Money Management, and More',
    snippet:
      'PayPal is the faster, safer way to send money, make an online payment, receive money or set up a merchant account.',
    category: 'general',
    aliases: ['paypal.com'],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    domain: 'amazon.com',
    url: 'https://www.amazon.com/',
    title: 'Amazon.com: Spend less. Smile more.',
    snippet:
      'Free shipping on millions of items. Get the best of Shopping and Entertainment with Prime. Enjoy low prices and great deals.',
    category: 'general',
    aliases: ['amazon.com', 'amazon store'],
  },
  {
    id: 'apple',
    name: 'Apple',
    domain: 'apple.com',
    url: 'https://www.apple.com/',
    title: 'Apple',
    snippet:
      'Discover the innovative world of Apple and shop everything iPhone, iPad, Apple Watch, Mac, and Apple TV.',
    category: 'general',
    aliases: ['apple.com'],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    domain: 'microsoft.com',
    url: 'https://www.microsoft.com/',
    title: 'Microsoft – Cloud, Computers, Apps & Gaming',
    snippet:
      'Explore Microsoft products and services for your home or business. Shop Surface, Microsoft 365, Xbox, Windows, Azure, and more.',
    category: 'general',
    aliases: ['microsoft.com'],
  },
  {
    id: 'google',
    name: 'Google',
    domain: 'google.com',
    url: 'https://www.google.com/',
    title: 'Google',
    snippet:
      'Search the world\'s information, including webpages, images, videos and more. Google has many special features to help you find exactly what you\'re looking for.',
    category: 'general',
    aliases: ['google.com'],
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    domain: 'x.com',
    url: 'https://x.com/',
    title: 'X. It’s what’s happening / X',
    snippet:
      'From breaking news and entertainment to sports and politics, get the full story with all the live commentary on X (formerly Twitter).',
    category: 'general',
    aliases: ['twitter', 'twitter.com', 'x.com'],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    domain: 'linkedin.com',
    url: 'https://www.linkedin.com/',
    title: 'LinkedIn: Log In or Sign Up',
    snippet:
      '750 million+ members | Manage your professional identity. Build and engage with your professional network. Access knowledge, insights and opportunities.',
    category: 'general',
    aliases: ['linkedin.com'],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    domain: 'instagram.com',
    url: 'https://www.instagram.com/',
    title: 'Instagram',
    snippet:
      'A simple, fun & creative way to capture, edit & share photos, videos & messages with friends & family.',
    category: 'general',
    aliases: ['instagram.com', 'ig'],
  },
  {
    id: 'reddit',
    name: 'Reddit',
    domain: 'reddit.com',
    url: 'https://www.reddit.com/',
    title: 'Reddit - Dive into anything',
    snippet:
      'Reddit is a network of communities where people can dive into their interests, hobbies and passions. There\'s a community for whatever you\'re interested in on Reddit.',
    category: 'general',
    aliases: ['reddit.com'],
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    domain: 'wikipedia.org',
    url: 'https://www.wikipedia.org/',
    title: 'Wikipedia, the free encyclopedia',
    snippet:
      'Wikipedia is a free online encyclopedia, created and edited by volunteers around the world and hosted by the Wikimedia Foundation.',
    category: 'general',
    aliases: ['wikipedia.org'],
  },
  {
    id: 'imdb',
    name: 'IMDb',
    domain: 'imdb.com',
    url: 'https://www.imdb.com/',
    title: 'IMDb: Ratings, Reviews, and Where to Watch the Best Movies & TV Shows',
    snippet:
      'IMDb is the world\'s most popular and authoritative source for movie, TV and celebrity content. Find ratings and reviews for the newest movie and TV shows.',
    category: 'general',
    aliases: ['imdb.com'],
  },
  {
    id: 'twitch',
    name: 'Twitch',
    domain: 'twitch.tv',
    url: 'https://www.twitch.tv/',
    title: 'Twitch',
    snippet:
      'Twitch is the world\'s leading video platform and community for gamers, live streams, esports, and interactive entertainment.',
    category: 'general',
    aliases: ['twitch.tv'],
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    domain: 'pinterest.com',
    url: 'https://www.pinterest.com/',
    title: 'Pinterest',
    snippet:
      'Discover recipes, home ideas, style inspiration and other ideas to try on Pinterest.',
    category: 'general',
    aliases: ['pinterest.com'],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    domain: 'tiktok.com',
    url: 'https://www.tiktok.com/',
    title: 'TikTok - Make Your Day',
    snippet:
      'TikTok - trends start here. On a device or on the web, viewers can watch and discover millions of personalized short videos.',
    category: 'general',
    aliases: ['tiktok.com'],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    domain: 'whatsapp.com',
    url: 'https://www.whatsapp.com/',
    title: 'WhatsApp | Secure and reliable private messaging',
    snippet:
      'Simple. Reliable. Private. With WhatsApp, you get fast, simple, secure messaging and calling for free, available on phones all over the world.',
    category: 'general',
    aliases: ['whatsapp.com', 'whatsapp web'],
  },
  {
    id: 'telegram',
    name: 'Telegram',
    domain: 'telegram.org',
    url: 'https://telegram.org/',
    title: 'Telegram Messenger',
    snippet:
      'Telegram is a cloud-based mobile and desktop messaging app with a focus on security and speed.',
    category: 'general',
    aliases: ['telegram.org', 'telegram web'],
  },
  {
    id: 'signal',
    name: 'Signal',
    domain: 'signal.org',
    url: 'https://signal.org/',
    title: 'Signal >> Home',
    snippet:
      'Signal is a simple, powerful, and secure messenger. Say "hello" to a different messaging experience.',
    category: 'general',
    aliases: ['signal.org', 'signal messenger'],
  },
  {
    id: 'bitwarden',
    name: 'Bitwarden',
    domain: 'bitwarden.com',
    url: 'https://bitwarden.com/',
    title: 'Bitwarden: Open Source Password Manager',
    snippet:
      'Bitwarden is the easiest and safest way for individuals, teams, and business organizations to store, share, and sync sensitive data.',
    category: 'it',
    aliases: ['bitwarden.com'],
  },
  {
    id: 'proton',
    name: 'Proton',
    domain: 'proton.me',
    url: 'https://proton.me/',
    title: 'Proton: Privacy by default',
    snippet:
      'Proton is a Swiss privacy company offering encrypted email, calendar, cloud storage, VPN, and password management.',
    category: 'general',
    aliases: ['protonmail', 'proton.me', 'proton mail'],
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    domain: 'duckduckgo.com',
    url: 'https://duckduckgo.com/',
    title: 'DuckDuckGo — Privacy, simplified.',
    snippet:
      'The Internet privacy company that empowers you to seamlessly take control of your personal information online.',
    category: 'general',
    aliases: ['duckduckgo.com', 'ddg'],
  },
  {
    id: 'brave',
    name: 'Brave',
    domain: 'brave.com',
    url: 'https://brave.com/',
    title: 'Brave: Secure, Fast & Private Web Browser with Adblocker',
    snippet:
      'The Brave browser is a fast, private and secure web browser for PC, Mac and mobile with built-in adblocking and tracker prevention.',
    category: 'general',
    aliases: ['brave browser', 'brave.com'],
  },
];

// Build an indexing map for fast key and alias resolution
const SITE_MAP = new Map<string, OfficialSite>();

for (const site of KNOWN_OFFICIAL_SITES) {
  SITE_MAP.set(site.id.toLowerCase(), site);
  SITE_MAP.set(site.name.toLowerCase(), site);
  SITE_MAP.set(site.domain.toLowerCase(), site);
  for (const alias of site.aliases) {
    SITE_MAP.set(alias.toLowerCase(), site);
  }
}

/**
 * Filter words indicating non-navigational informational queries
 */
const NON_NAVIGATIONAL_PATTERNS = [
  /\b(vs|versus|compare|comparison|difference between|alternative|alternatives)\b/i,
  /\b(how to|why|when|what is|tutorial|course|learn|guide for|cheat sheet|error|exception|troubleshoot)\b/i,
  /\b(review|reviews|salary|jobs|careers|net worth|founder|owner)\b/i,
];

/**
 * Common filler terms in navigational searches (e.g., "react official site", "spotify website")
 */
const NAVIGATIONAL_FILLER_REGEX =
  /\b(official site|official website|official|website|site|homepage|home page|home|web|portal|login|signin|sign in|download|app|docs|documentation)\b/gi;

/**
 * Detect whether a query seeks an official site or web app homepage,
 * and if so, return its verified official configuration.
 */
export function findKnownOfficialSite(rawQuery: string): OfficialSite | null {
  if (!rawQuery) return null;
  const trimmed = rawQuery.trim();

  // If query explicitly expresses comparative or troubleshooting intent, do not force official site card
  if (NON_NAVIGATIONAL_PATTERNS.some((pat) => pat.test(trimmed))) {
    return null;
  }

  // 1. Direct match on raw input
  const directKey = trimmed.toLowerCase();
  if (SITE_MAP.has(directKey)) {
    return SITE_MAP.get(directKey)!;
  }

  // 2. Strip standard navigational suffixes ("react official site" -> "react")
  const stripped = directKey.replace(NAVIGATIONAL_FILLER_REGEX, '').trim();
  if (stripped && SITE_MAP.has(stripped)) {
    return SITE_MAP.get(stripped)!;
  }

  // 3. Normalize dots, hyphens, and spaces ("next.js" -> "nextjs", "react-js" -> "reactjs")
  const noPunctuation = stripped.replace(/[-_.]+/g, '').replace(/\s+/g, '');
  if (noPunctuation && SITE_MAP.has(noPunctuation)) {
    return SITE_MAP.get(noPunctuation)!;
  }

  // 4. Try matching domain directly (e.g. "https://react.dev" or "react.dev")
  const cleanDomain = trimmed
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .toLowerCase();
  if (cleanDomain && SITE_MAP.has(cleanDomain)) {
    return SITE_MAP.get(cleanDomain)!;
  }

  return null;
}

