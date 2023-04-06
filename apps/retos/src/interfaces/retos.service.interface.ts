

export interface RetosServiceInterface {
getReto(): Promise<any>;
addReto(newUser): Promise<any>;
asignarReto(reto): Promise<any>;
}