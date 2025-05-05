/**
 * Generic interface for data mappers
 *
 * @typeParam TEntity - The domain entity type
 * @typeParam TResponseDto - The response DTO type
 * @typeParam TRequestDto - The request DTO type
 */
export interface IMapper<TEntity, TResponseDto, TRequestDto> {
	/**
	 * Maps from domain entity to response DTO
	 *
	 * @param entity - The entity to map from
	 * @returns A response DTO
	 */
	toResponseDto(entity: TEntity): TResponseDto;

	/**
	 * Maps from request DTO to domain entity
	 * Used for creation operations
	 *
	 * @param dto - The request DTO to map from
	 * @returns A domain entity
	 */
	toEntity(dto: TRequestDto): TEntity;

	/**
	 * Maps from request DTO to domain entity for updates
	 * Merges with existing entity
	 *
	 * @param dto - The request DTO with updates
	 * @param existingEntity - The existing entity to update
	 * @returns An updated domain entity
	 */
	toEntityForUpdate(dto: Partial<TRequestDto>, existingEntity: TEntity): TEntity;
}
