export class UserNotFoundError extends Error {
	constructor(
		message: string = "User not found",
		public userId?: string,
	) {
		super(message);
		this.name = "UserNotFoundError";

		// Ensures the correct prototype chain is maintained
		Object.setPrototypeOf(this, UserNotFoundError.prototype);
	}

	toString() {
		return this.userId
			? `${this.name}: ${this.message} (User ID: ${this.userId})`
			: `${this.name}: ${this.message}`;
	}
}
