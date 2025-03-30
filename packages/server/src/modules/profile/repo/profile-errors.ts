export class ProfileNotFoundError extends Error {
	constructor(
		message: string = "User profile not found",
		public userId?: string,
	) {
		super(message);
		this.name = "ProfileNotFoundError";

		// Ensures the correct prototype chain is maintained
		Object.setPrototypeOf(this, ProfileNotFoundError.prototype);
	}

	toString() {
		return this.userId
			? `${this.name}: ${this.message} (User ID: ${this.userId})`
			: `${this.name}: ${this.message}`;
	}
}
