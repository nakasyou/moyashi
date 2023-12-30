import { Mod, RouteStack, Routes } from '..'

type RouteByRoutes <Route extends RouteStack<string>> = {

}
type ClientByRoutes <MainRoutes extends Routes> = {
  [Key in keyof MainRoutes]: RouteStack<string, {}> extends MainRoutes[Key] ? RouteByRoutes<MainRoutes[Key]> : never
}
type ClientByMod <MainMod extends Mod<string>> = {
  route: {
    [Key in keyof MainMod['routes']]: ClientByRoutes<MainMod['routes'][Key]>
  }
}
export const createClient = <MainMod extends Mod<string>> (): ClientByMod<MainMod> => {
  
}
