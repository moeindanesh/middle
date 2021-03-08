import { UserData } from './types'

export class Users {
  private users: Record<string, UserData>

  constructor() {
    this.users = {}
  }

  addUser = (user: UserData) => {
    // check if user already exists in model
    if (this.users[user.id]) {
      console.warn('[Model] [Users] [addUser] user already exists')
      return
    }

    // add user
    this.users[user.id] = user
  }

  removeUser = (userId: string) => {
    let filteredUsers: Record<string, UserData> = {}

    for (let key in this.users) {
      if (key !== userId) {
        filteredUsers[key] = this.users[key]
      }
    }

    this.users = filteredUsers
  }

  getUsers = () => {
    return this.users
  }
}
