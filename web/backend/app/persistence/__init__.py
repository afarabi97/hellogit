"""
Package contains code that deal with persisting objects (usually models).
"""

from typing import List, Optional, Union, Dict
from abc import ABC, ABCMeta, abstractmethod, abstractstaticmethod
from flask import Flask
from pymongo import MongoClient
from app.models import Model
from flask_pymongo import PyMongo
from pymongo.cursor import Cursor
from pymongo.database import Database

class DBModelNotFound(Exception):
    """
    This should be raised in instances where a lookup did not find the the object.
    """
    pass

class IndexInitializationError(Exception):
    pass

class IndexableMixin:
    """
    The `IndexableMixin` class provides functionality for managing indexes.

    Attributes:
        indexes (list): A list to store the indexes.

    Methods:
        create_indexes(): Creates all the indexes in the list.
        _create_index(index): [Not Implemented] Subclasses must implement this method to create an index.
    """

    def __init__(self):
        self._indexes = []
        self._indexes_initialized = False

    def initialize_indexes(self):
        # import pdb; pdb.set_trace();
        if not self._indexes_initialized:
            self._create_indexes()
            self._indexes_initialized = True

    @property
    def indexes_initialized(self):
        return self._indexes_initialized

    @property
    def indexes(self):
        return self._indexes

    def _create_indexes(self):
        for index in self.indexes:
            self._create_index(index)

    def _create_index(self, index):
        raise NotImplementedError("Subclasses must implement _create_index method")

class Datastore(ABC):
    """
    The `Datastore` class is an abstract base class that defines the interface for a datastore.

    Methods:
        - `register_with_app(app)`: Registers the datastore with a Flask application.
        - `db`: Property that returns the database object.
        - `client`: Property that returns the client object.
    """

    @abstractmethod
    def register_with_app(self, app: Flask):
        pass

    @property
    @abstractmethod
    def db(self) -> Union[Database, None]:
        pass

    @property
    @abstractmethod
    def client(self):
        pass

class MongoStore(Datastore):
    """
    The `MongoStore` class is a concrete implementation of the `Datastore` interface for MongoDB.

    Methods:
        - `__init__(store, app, uri)`: Initializes the `MongoStore` object.
        - `register_with_app(app)`: Registers the `MongoStore` with a Flask application.
        - `db`: Property that returns the MongoDB database object.
        - `client`: Property that returns the MongoDB client object.
    """

    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(MongoStore, cls).__new__(cls)
        return cls._instance


    def __init__(self, uri: str = "mongodb://localhost:27017/tfplenum_database"):
        """
        The __init__ method initializes the MongoStore object.

        Args:
            store (PyMongo, optional): the PyMongo object used to connect to the MongoDB database. Defaults to None.
            app (Flask, optional): the Flask application used to connect to the MongoDB database. Defaults to None.
            uri (str, optional): the URI used to connect to the MongoDB database. Defaults to "mongodb://localhost:27017/tfplenum_database".
        """
        if not hasattr(self, '_initialized'):
            self.uri = uri
            self.store = PyMongo()
            self._initialized = True
            # if app is not None:
            #     app.config["MONGO_URI"] = uri
            #     self.store = PyMongo(app)
            # else:
            #     raise ValueError("Flask app must be provided for MongoStore initialization")
            # self._initialized = True

    def register_with_app(self, app):
        """The register_with_app method registers the MongoStore object with the Flask application.

        Args:
            app (Flask): the Flask application to register the MongoStore object with.
        """
        self.store.init_app(app=app, uri=self.uri)

    @property
    def db(self) -> Database:
        """The db property returns the MongoDB database.

        Returns:
            Database: the MongoDB database.
        """
        return self.store.db

    @property
    def client(self) -> MongoClient:
        """The client property returns the MongoDB client.

        Returns:
            MongoClient: the MongoDB client.
        """
        return self.store.cx()

class Repo(ABC, IndexableMixin):

    def __init__(self):
        super().__init__()

    @abstractmethod
    def add(self, model: Union[Model,Dict]) -> Union[Model,Dict]:
        pass

    @abstractmethod
    def get(self, _id: str) -> Union[Model,Dict]:
        pass

    @abstractmethod
    def get_by_key(self, key: str, value: str) -> Union[Model,Dict]:
        pass

    @abstractmethod
    def remove(self, _id: str) -> None:
        pass

    @abstractmethod
    def get_all(self) -> List[Union[Model,Dict]]:
        pass

    @abstractmethod
    def _find(self, key: Optional[str] = None, val: Optional[str] = None) -> Union[Model, List[Model]]:
        return NotImplementedError("Subclasses must implement _find method")

class MongoRepo(Repo):
    """
    The `MongoRepo` class represents a repository for managing MongoDB documents.

    Args:
        collection_name (str): The name of the collection in MongoDB.
        store (MongoStore, optional): The `MongoStore` object used to connect to the MongoDB database. Defaults to None.

    Methods:
        add(model): Adds a `Model` object to the collection.
        get(_id): Retrieves a `Model` object from the collection based on the specified `_id`.
        get_by_key(key, value): Retrieves a `Model` object from the collection based on the specified key-value pair.
        remove(_id): Removes a document from the collection based on the specified `_id`.
        get_all(): Retrieves all documents from the collection.
        _find_doc(key, val): Searches for documents in the collection based on the provided key-value pair.
        _find(key, val): [Not Implemented] Subclasses must implement this method to find documents in the collection.

    Note: This class should be subclassed to implement the `_find` method.
    """

    def __init__(self, collection_name: str, store: MongoStore = None):
        super().__init__()
        self.database = store.db if store else MongoStore().db
        self.collection = self.database[collection_name]

    def add(self, model: Model):
        self.collection.insert_one(model.to_dict())

    def get(self, _id: str) -> Model:
        return self._find("_id", _id)

    def get_by_key(self, key: str, value: str) -> Union[Model,Dict]:
        return self.collection.find_one({key: value})

    def remove(self, _id: str) -> None:
        self.collection.delete_one({"_id": _id})

    def get_all(self) -> List[Union[Model,Dict]]:
        return self._find()

    def _create_index(self, index: Dict):
        """
        The `_create_index` function creates an index in the collection based on the provided index.
        Only call this function if you want to create an index in the collection.
        There is no need to call this function, just provide the indexes in the `_indexes` attribute
        and call the `initialize_indexes` method to create the indexes.

        Example:
            self._indexes = [
                {'keys':[("sha256", 1)], 'unique': True},
                {'keys':[("name", 1)], 'unique': True},
                {'keys':[("path", 1)], 'unique': True}
            ]
            self.initialize_indexes()
        """
        if not self.indexes_initialized and index:
            self.collection.create_index(**index)

    def _find_doc(self, key: Optional[str] = None, val = None) -> Union[Cursor, Dict]:
        """
        The `_find_doc` function searches for documents in the collection based on the provided key-value pair.
        It can be used to find all the documents in the collection or a single document in the collection.
        Use this function to implement the `_find` method in subclasses.

        Args:
            self: The instance of the class.
            key (Optional[str]): The key to search for in the documents.
            val: The value to match with the key in the documents.

        Returns:
            Union[Cursor, Dict]: If no key-value pair is provided, it returns a cursor with all the documents in the collection. If a key-value pair is provided, it returns a single document that matches the key-value pair. If no document is found, an empty dictionary is returned.

        """

        doc: Union[Cursor, Dict]
        if not any((key, val)):
            # You want all the models
            doc = self.collection.find({})

        if all((key, val)):
            # You want a specific model
            doc = self.collection.find_one({key: val})
        return {} if doc is None else doc

    def _find(self, key: Optional[str] = None, val: Optional[str] = None) -> Union[Model, List[Model]]:
        """
        CLASSES MUST IMPLEMENT THIS METHOD. HERE IS AN EXAMPLE OF HOW TO IMPLEMENT IT:

            ``` python
                # ... Other methods and code ...

                def _find(self, key: Optional[str] = None, val: Optional[str] = None) -> Union[PcapModel, List[PcapModel]]:
                    # Finds document(s) in the collection based on the specified key-value pair and
                    # returns it as a `PcapModel` object or a list of `PcapModel` objects.
                    # TODO: Raise DBModelNotFound if no document is found matching the specified key-value pair.
                    doc = self._find_doc(key, val)
                    return PcapModel(**doc) if isinstance(doc, dict) else [PcapModel(**_doc) for _doc in doc]
            ```
        """
        return NotImplementedError("Subclasses must implement _find method")
