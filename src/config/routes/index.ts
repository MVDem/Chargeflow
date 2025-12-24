export const routes = {
  home: {
    path: '/',
    label: 'Home',
  },
  notFound: {
    path: '*',
    label: 'Not Found',
  },
} as const;

export type RouteKey = keyof typeof routes;
export type RoutePath = (typeof routes)[RouteKey]['path'];
