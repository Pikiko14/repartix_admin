import { americanPhoneCodes } from './constant'
import { useAuthStore } from 'src/stores/authStore'

const store = useAuthStore()

export class Utils {
  validateRole = (role) => {
    const user = store.getUser
    return user.scopes.includes(role)
  }

  validateUsability = (usability) => {
    const user = store.getUser
    if (!user.subscription) return false
    const { usabilities } = user.subscription
    return usabilities.find((el) => el.name === usability)
  }

  getConfiguration = () => {
    const user = store.getUser
    return user.brand.configuration;
  }

  loadLatLng = async (cityName) => {
    const data = await this.loadAddressFormGMap(cityName)
    if (data && data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location
      const boundsData = data.results[0].geometry.bounds
      return {
        lat,
        lng,
        bounds: {
          north: boundsData.northeast.lat,
          south: boundsData.southwest.lat,
          east: boundsData.northeast.lng,
          west: boundsData.southwest.lng,
        },
      }
    }
  }

  loadAddressFormGMap = async (cityName) => {
    const config = this.getConfiguration()

    if (!config.enable_google_map) return

    let country = null;

    if (config) country = americanPhoneCodes.find((el) => el.currency === config.currency);

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityName)}&components=country:${country.iso}&key=${config.gmap_api__key}`,
      )
      const data = await res.json()
      return data
    } catch (error) {
      console.error(error)
      return null;
    }
  }
}
