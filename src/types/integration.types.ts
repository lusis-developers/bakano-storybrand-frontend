// Tipos para integraciones (Facebook/Meta y otras)

export interface IIntegrationPage {
  id: string
  name: string
  category?: string
  accessToken: string
  pictureUrl?: string
}

export interface IFacebookConnectResponse {
  message: string
  pages: IIntegrationPage[]
}

export interface IIntegrationError {
  status?: number
  message: string
}