/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        // 태블릿(갤럭시탭 S10+ 등) 세로모드에서도 모바일 드릴다운 뷰가 표시되도록
        // 가로 폭 1200px 이상이면서 가로(landscape) 방향일 때만 데스크톱 다중 패널 뷰 활성화
        lg: { raw: '(min-width: 1200px) and (orientation: landscape)' },
      },
      colors: {
        sage: {
          500: '#5ea578',
          600: '#4e8d64',
        },
        slate: {
          100: '#eef2f6',
          200: '#d9e2ec',
          300: '#bccad9',
          400: '#94a4b8',
        }
      }
    },
  },
  plugins: [],
}
