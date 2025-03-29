// export interface EntityMapper<T, X> {
//     // mapToEntity(data: any): T;
//     // mapFromDto(dto: X): T;
// };

export interface EntityFactory<X, Y> {
	createEntity(dto: X): Y;
}
