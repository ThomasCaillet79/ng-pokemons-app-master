import { Injectable } from '@angular/core';
import { Pokemon } from './pokemon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable()
export class PokemonsService {

	pokemons: Pokemon[] = null;
	pokemon: Pokemon = null;

	// le point d’accés à notre API // dev : 'api/pokemons';
	private pokemonsUrl = 'https://pokemon-app-mt-default-rtdb.firebaseio.com/pokemons';

	constructor(private http: HttpClient) { }

	/** GET pokemons */
	getPokemons(): Pokemon[] {
		let names = [];
		this.pokemons = [];
		this.http.get<any[]>(this.pokemonsUrl + ".json").pipe(
			tap(_ => this.log(`fetched pokemons`)),
			catchError(this.handleError('getPokemons', []))
		).subscribe(next => {
			names = Object.keys(next);
			for (let i = 0; i < names.length; i++) {
				let pokemon_to_add = new Pokemon();
				pokemon_to_add.name = names[i];
				pokemon_to_add.id = next[names[i]].id;
				pokemon_to_add.hp = next[names[i]].hp;
				pokemon_to_add.cp = next[names[i]].cp;
				pokemon_to_add.picture = next[names[i]].picture;
				pokemon_to_add.types = next[names[i]].types;
				pokemon_to_add.created = next[names[i]].created;

				this.pokemons.push(pokemon_to_add);
			}
		});

		return this.pokemons;
	}
	// ICI !!!!! \\\
	/** GET pokemon */
	getPokemon(id: number): Observable<Pokemon> {
		const url = `${this.pokemonsUrl}/${id}`;

		return this.http.get<Pokemon>(url).pipe(
			tap(_ => this.log(`fetched pokemon id=${id}`)),
			catchError(this.handleError<Pokemon>(`getPokemon id=${id}`))
		);
	}

	/** PUT: update the pokemon on the server */
	updatePokemon(pokemon: Pokemon): Observable<any> {
		const httpOptions = {
			headers: new HttpHeaders({ 'Content-Type': 'application/json' })
		};

		return this.http.put(this.pokemonsUrl, pokemon, httpOptions).pipe(
			tap(_ => this.log(`updated pokemon id=${pokemon.id}`)),
			catchError(this.handleError<any>('updatePokemon'))
		);
	}

	/** DELETE pokemon */
	deletePokemon(pokemon: Pokemon): Observable<Pokemon> {
		const url = `${this.pokemonsUrl}/${pokemon.id}`;
		const httpOptions = {
			headers: new HttpHeaders({ 'Content-Type': 'application/json' })
		};

		return this.http.delete<Pokemon>(url, httpOptions).pipe(
			tap(_ => this.log(`deleted pokemon id=${pokemon.id}`)),
			catchError(this.handleError<Pokemon>('deletePokemon'))
		);
	}

	/** POST pokemon */
	addPokemon(pokemon: Pokemon): Observable<Pokemon> {
		const httpOptions = {
			headers: new HttpHeaders({ 'Content-Type': 'application/json' })
		};

		return this.http.post<Pokemon>(this.pokemonsUrl, pokemon, httpOptions).pipe(
			tap((pokemon: Pokemon) => this.log(`added pokemon with id=${pokemon.id}`)),
			catchError(this.handleError<Pokemon>('addPokemon'))
		);
	}

	/* GET pokemons search */
	searchPokemons(term: string): Observable<Pokemon[]> {
		if (!term.trim()) {
			// si le terme de recherche n'existe pas, on renvoie un tableau vide.
			return of([]);
		}

		return this.http.get<Pokemon[]>(`api/pokemons/?name=${term}`).pipe(
			tap(_ => this.log(`found pokemons matching "${term}"`)),
			catchError(this.handleError<Pokemon[]>('searchPokemons', []))
		);
	}

	// Retourne la liste des types des Pokémons
	getPokemonTypes(): Array<string> {
		return [
			'Plante', 'Feu', 'Eau', 'Insecte', 'Normal', 'Electrik',
			'Poison', 'Fée', 'Vol', 'Combat', 'Psy'
		];
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
