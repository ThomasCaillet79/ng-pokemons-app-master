import { Injectable } from '@angular/core';
import { Pokemon } from './pokemon';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable()
export class PokemonsService {

	pokemons: Pokemon[] = null;
	pokemon: Pokemon = null;
	idMax: number = 0;

	// le point d’accés à notre API // dev : 'api/pokemons';
	private pokemonsUrl = 'https://pokemon-app-mt-default-rtdb.firebaseio.com/pokemons';

	constructor(private http: HttpClient) { }

	/** GET pokemons */
	getPokemons(): Pokemon[] {
		let ids = [];
		let num_ids: number[] = [];
		this.pokemons = [];
		this.http.get<any[]>(this.pokemonsUrl + ".json").pipe(
			tap(_ => this.log(`fetched pokemons`)),
			catchError(this.handleError('getPokemons', []))
		).subscribe(next => {
			ids = Object.keys(next);
			for (let i = 0; i < ids.length; i++) {
				if(next[ids[i]] != null){
					let pokemon_to_add = new Pokemon();
					pokemon_to_add.id = +next[ids[i]].id;
					num_ids.push(pokemon_to_add.id);
					pokemon_to_add.name = next[ids[i]].name;
					pokemon_to_add.hp = next[ids[i]].hp;
					pokemon_to_add.cp = next[ids[i]].cp;
					pokemon_to_add.picture = next[ids[i]].picture;
					pokemon_to_add.types = next[ids[i]].types;
					pokemon_to_add.created = next[ids[i]].created;

					this.pokemons.push(pokemon_to_add);
				}
			}
			this.idMax = Math.max(...num_ids) + 1;
		});

		return this.pokemons;
	}

	/** GET pokemon */
	getPokemon(id: number): Pokemon {
		const url = this.pokemonsUrl + "/" + id.toString() + ".json";
		this.pokemon = new Pokemon();

		this.http.get<Pokemon>(url).pipe(
			tap(_ => this.log(`fetched pokemon id=${id}`)),
			catchError(this.handleError<Pokemon>(`getPokemon id=${id}`))
		).subscribe(next => {
			this.pokemon.id = +next.id;
			this.pokemon.name = next.name;
			this.pokemon.hp = next.hp;
			this.pokemon.cp = next.cp;
			this.pokemon.picture = next.picture;
			this.pokemon.types = next.types;
			this.pokemon.created = next.created;
			this.pokemons.push(this.pokemon);
		});

		return this.pokemon;
	}

	/** PUT: update the pokemon on the server */
	updatePokemon(pokemon: Pokemon): Observable<any> {
		const httpOptions = {
			headers: new HttpHeaders({ 'Content-Type': 'application/json' })
		};

		return this.http.put(this.pokemonsUrl + '/' + pokemon.id.toString() + '.json', pokemon, httpOptions).pipe(
			tap(_ => this.log(`updated pokemon id=${pokemon.id}`)),
			catchError(this.handleError<any>('updatePokemon'))
		);
	}

	/** DELETE pokemon */
	deletePokemon(pokemon: Pokemon): Observable<Pokemon> {
		const url = this.pokemonsUrl + '/' + pokemon.id.toString() + '.json';
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

		return this.http.put<Pokemon>(this.pokemonsUrl + '/' + this.idMax + '.json', pokemon, httpOptions).pipe(
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

		let ids = [];
		let pokemonsSearched: Pokemon[] = [];
		this.http.get<any>(this.pokemonsUrl + '.json').pipe(
			tap(_ => this.log(`found pokemons matching "${term}"`)),
			catchError(this.handleError<Pokemon[]>('searchPokemons', []))
			).subscribe(next => {
					ids = Object.keys(next);
					for (let i = 0; i < ids.length; i++) {
						if(next[ids[i]] != null && next[ids[i]].name.includes(term)){
							pokemonsSearched.push(next[ids[i]]);
						}
					}
			});
		return of(pokemonsSearched);
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
