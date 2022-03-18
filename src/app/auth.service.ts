import { Injectable } from '@angular/core';
// RxJS 6
import { Observable, of } from 'rxjs';
import {tap, delay, catchError} from 'rxjs/operators';
import {HttpClient} from "@angular/common/http";

@Injectable()
export class AuthService {
	isLoggedIn: boolean = false; // L'utilisateur est-il connecté ?
	isLoggedIn2: boolean = false;
	isAdm:  any[] | boolean = false;
	listPoke: number[];
	redirectUrl: string; // où rediriger l'utilisateur après l'authentification ?
	name : string;
	password: string;
	private urlUsers = 'https://pokemon-beb38-default-rtdb.europe-west1.firebasedatabase.app/users';
	constructor(private http: HttpClient) { }

	// Une méthode de connexion
	login(name: string, password: string): Observable<boolean> {
		// Faites votre appel à un service d'authentification...
		//let isLoggedIn = (name === 'pikachu' && password === 'pikachu');


		this.http.get<string>(this.urlUsers+"/"+name+"/password.json").pipe(
			tap(_ => this.log(`login`)),
			catchError(this.handleError('login', []))
		).subscribe(next => {
			let isLoggedIn = next === password;
			this.isLoggedIn2 = isLoggedIn;
		});
		this.name = name;
		this.password = password;

		this.getUser();
		this.getListPokemon();
		this.isAdmin();

		return of(true).pipe(
			delay(1000),
			tap(val => this.isLoggedIn = this.isLoggedIn2)
		);


	}

	getUser(){
		return this.name;
	}

	isAdmin(){
		this.http.get<boolean>(this.urlUsers+"/"+this.name+"/admin.json").pipe(
			tap(_ => this.log(`fetched Admin`)),
			catchError(this.handleError('isAdmin', []))
		).subscribe(next => {
			this.isAdm = next;
		});
		return this.isAdm;
	}

	getListPokemon(){
		this.http.get<number[]>(this.urlUsers+"/"+this.name+"/listePoke.json").pipe(
			tap(_ => this.log(`fetched Liste pokemons`)),
			catchError(this.handleError('getListPokemon', []))
		).subscribe(next => {
			this.listPoke = next;
		});

		return this.listPoke;
	}

	// Une méthode de déconnexion
	logout(): void {
		this.isLoggedIn = false;
	}

	/* handleError */
	private handleError<T>(operation = 'operation', result?: T) {
		return (error: any): Observable<T> => {
			console.error(error);
			console.log(`${operation} failed: ${error.message}`);

			return of(result as T);
		};
	}

	/* log */
	private log(log: string) {
		console.info(log);
	}
}
