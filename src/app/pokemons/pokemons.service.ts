import { Injectable } from '@angular/core';
import { Pokemon } from './pokemon';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {AuthService} from "../auth.service";


@Injectable()
export class PokemonsService {

	pokemons: Pokemon[] = null;
	pokemons2: Pokemon[] = null;

	pokemon: Pokemon = null;
	idMax: number = 0;

	// le point d’accés à notre API // dev : 'api/pokemons';
	private pokemonsUrl = 'https://pokemon-beb38-default-rtdb.europe-west1.firebasedatabase.app/pokemons';
	private urlUsers = 'https://pokemon-beb38-default-rtdb.europe-west1.firebasedatabase.app/users';


	constructor(private http: HttpClient, private authService: AuthService) { }

	/** GET pokemons */
	getPokemons(): Pokemon[] {
		let ids = [];
		let num_ids: number[] = [];
		this.pokemons = [];
		this.pokemons2 = [];
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

					if (this.authService.isAdm){
						this.pokemons.push(pokemon_to_add);
					}
					else {
						let listeUserPoke = this.authService.getListPokemon();
						for (let k = 0; k < listeUserPoke.length; k++){
							if(pokemon_to_add.id == listeUserPoke[k]) {
								this.pokemons.push(pokemon_to_add);
							}
						}
					}
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
		console.log(this.pokemons.includes(this.pokemon))
		return this.pokemon;
	}

	/** PUT: update the pokemon on the server */
	updatePokemon(pokemon: Pokemon): Observable<any> {
		if(this.authService.isAdm){
			const httpOptions = {
				headers: new HttpHeaders({ 'Content-Type': 'application/json' })
			};

			return this.http.put(this.pokemonsUrl + '/' + pokemon.id.toString() + '.json', pokemon, httpOptions).pipe(
				tap(_ => this.log(`updated pokemon id=${pokemon.id}`)),
				catchError(this.handleError<any>('updatePokemon'))
			);
		}
		else{
			return of();
		}

	}

	/** DELETE pokemon */
	deletePokemon(pokemon: Pokemon): Observable<Pokemon> {
		if(this.authService.isAdm) {

			const url = this.pokemonsUrl + '/' + pokemon.id.toString() + '.json';
			const httpOptions = {
				headers: new HttpHeaders({'Content-Type': 'application/json'})
			};

			return this.http.delete<Pokemon>(url, httpOptions).pipe(
				tap(_ => this.log(`deleted pokemon id=${pokemon.id}`)),
				catchError(this.handleError<Pokemon>('deletePokemon'))
			);
		}
		else {
			return of();
		}
	}

	/** POST pokemon */
	addPokemon(pokemon: Pokemon): Observable<Pokemon> {
		if(this.authService.isAdm) {

			const httpOptions = {
				headers: new HttpHeaders({'Content-Type': 'application/json'})
			};

			return this.http.put<Pokemon>(this.pokemonsUrl + '/' + this.idMax + '.json', pokemon, httpOptions).pipe(
				tap((pokemon: Pokemon) => this.log(`added pokemon with id=${pokemon.id}`)),
				catchError(this.handleError<Pokemon>('addPokemon'))
			);
		}
		else {
			return of();
		}
	}

	addUserPokemon(): Observable<number> {
		const httpOptions = {
			headers: new HttpHeaders({'Content-Type': 'application/json'})
		};

		let listeUsPoke = this.authService.listPoke;
		//listeUsPoke.push(Math.floor(Math.random()*this.pokemons.length));
		// @ts-ignore
		return this.http.put<number>(this.urlUsers+"/"+this.authService.name+"/listePoke/"+listeUsPoke.length+".json", Math.floor(Math.random()*this.pokemons.length), httpOptions).pipe(
			tap((pokemon: number) => this.log(`added pokemon with `)),
			catchError(this.handleError<number[]>('addPokemon'))
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
						if(next[ids[i]] != null && next[ids[i]].name.toLowerCase().includes(term.toLowerCase())){
							for (let j = 0; j < this.pokemons.length; j++){
								if(this.pokemons[j].id == next[ids[i]].id){
									pokemonsSearched.push(next[ids[i]]);
								}
							}
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
