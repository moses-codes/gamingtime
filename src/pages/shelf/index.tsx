import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import Layout from "~/components/layout/Layout";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ReactEventHandler, ReactHTMLElement, useState } from "react"

import { api } from "~/utils/api";
import { type } from "os";

interface BoardGame {
    complexity: number;
    id: number;
    image: string | null;
    maxPlayers: number;
    minPlayers: number;
    playTime: number;
    title: string;
    mechanics: [];
}

interface Mechanic {
    id: number,
    mechanicText: string,
}

export default function Home() {

    const [boardGames, setBoardGames] = useState<any>([])

    const removeGame = api.boardGames.removeGameFromShelf.useMutation({
        onSuccess: (removedGame) => {
            console.log(removedGame.title, ' has been removed from your shelf.')
            setBoardGames([...boardGames].filter(g => g.id !== removedGame.id))
            const notifyRemoved = () => {
                toast.info(`${removedGame.title} has been removed from your shelf.`, {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
            //toast notification
            notifyRemoved()
        }
    });

    const handleChangeSort = (e: React.MouseEvent<HTMLButtonElement>) => {

        let target = e.target as HTMLButtonElement
        let input = target.id

        if (input === "alphaAz") {
            setBoardGames([...boardGames].sort((a, b) => a.title.localeCompare(b.title)))
        }
        if (input === "alphaZa") {
            setBoardGames([...boardGames].sort((a, b) => b.title.localeCompare(a.title)))
        }
        if (input === "complexityAsc") {
            setBoardGames([...boardGames].sort((a, b) => a.complexity - b.complexity))
        }
        if (input === "complexityDesc") {
            setBoardGames([...boardGames].sort((a, b) => b.complexity - a.complexity))
        }

    }

    const { data: userGames } = api.boardGames.getUserGames.useQuery(undefined, {
        onSuccess: (data) => {
            console.log(data)
            setBoardGames(data);
            console.log('usergames are', userGames)
        },
    });

    async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
        let deletedGameId: number = Number(e.currentTarget.value);
        const result = await removeGame.mutate({ id: deletedGameId });
    }

    // console.log('the users games are: ', { boardGames })



    return (
        <>
            <Layout>
                <Head>
                    <title>MeepleMatch: Shelf</title>
                    <meta name="description" content="Generated by create-t3-app" />
                    <link rel="icon" href="/3d-meeple-svgrepo-com.svg" />
                </Head>
                <main className=" flex min-h-screen flex-col items-center bg-slate-300">
                    <h1 className="text-5xl pt-10 pb-4">Library</h1>
                    <div className="">
                        {boardGames?.length ?
                            <div className="dropdown dropdown-hover  w-full flex justify-center">
                                <label tabIndex={0} className="btn w-52">Sort By...</label>
                                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li><button onClick={handleChangeSort} id="alphaAz">Alpha &#40;A-Z&#41;</button></li>
                                    <li><button onClick={handleChangeSort} id="alphaZa">Alpha &#40;Z-A&#41;</button></li>
                                    <li><button onClick={handleChangeSort} id="complexityAsc">Complexity &#40;asc.&#41;</button></li>
                                    <li><button onClick={handleChangeSort} id="complexityDesc">Complexity &#40;desc.&#41;</button></li>
                                </ul>
                            </div>
                            : <h2 className="text-center text-2xl">Your shelf is empty! Why not <Link href='/search'><span className="text-blue-500 hover:underline">add some games?</span></Link></h2>
                        }


                        <ul className="flex flex-wrap justify-around w-screen my-5  container mx-auto ">

                            {boardGames && boardGames.map((game: BoardGame) => {
                                return <li className="card w-96 bg-base-100 shadow-xl p-5 m-5 text-center  mx-2" key={game.id}>
                                    <h2 className="text-2xl font-bold truncate truncate-ellipsis mb-4">{game.title}</h2>

                                    <img className='inline-block mx-auto mb-4 h-32 rounded-md' src={game.image || ''} alt={`Box art for ${game.title}`} />
                                    {game.minPlayers === game.maxPlayers ?
                                        game.minPlayers === 1 ? <p>1 player</p> : <p>{game.maxPlayers} players</p>
                                        :
                                        <p>Players: {game.minPlayers} - {game.maxPlayers}</p>}
                                    <p>Play time: {game.playTime} min</p>
                                    <p>Complexity: {(game.complexity).toPrecision(3)} / 5</p>
                                    <details className="dropdown mb-10 mt-5">
                                        <summary className="m-1 btn">Mechanics</summary>
                                        <ul className="p-2 shadow menu dropdown-content z-[1] rounded-box w-64 mx-12 bg-blue-200">
                                            {game.mechanics.map((m: Mechanic) => {
                                                return <li key={m.id}>{m.mechanicText}</li>
                                            })}
                                        </ul>
                                    </details>
                                    <button
                                        onClick={handleClick}
                                        className="btn btn-error w-1/2 mx-auto"
                                        value={game.id}
                                    >Delete</button>
                                </li>
                            })}

                        </ul>
                    </div>
                </main>
            </Layout>
        </>
    );
}